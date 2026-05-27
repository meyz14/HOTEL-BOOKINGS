import {
  authenticateRequest,
  clerkClient,
  getAuth,
} from "@clerk/express";
import { verifyToken } from "@clerk/backend";
import User from "../models/User.js";
import {
  AUTHORIZED_PARTIES,
  clerkMiddlewareOptions,
} from "../configs/clerkAuth.js";

const getBearerToken = (req) => {
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "")?.trim();
  if (!bearer || bearer === "null" || bearer === "undefined") return null;
  return bearer;
};

const buildUserFields = ({ email, firstName, lastName, image, userId }) => {
  const username =
    `${firstName || ""} ${lastName || ""}`.trim() || email || "User";

  return {
    email: email || `${userId}@clerk.user`,
    username,
    image: image || "",
  };
};

const syncUserFromSessionClaims = async (userId, sessionClaims) => {
  if (!sessionClaims) return null;

  const email =
    sessionClaims.email ||
    sessionClaims.primary_email_address ||
    sessionClaims.email_address ||
    "";

  const fields = buildUserFields({
    userId,
    email,
    firstName: sessionClaims.first_name || sessionClaims.given_name,
    lastName: sessionClaims.last_name || sessionClaims.family_name,
    image: sessionClaims.image_url || sessionClaims.picture,
  });

  if (!email && fields.username === "User") return null;

  return User.findByIdAndUpdate(userId, fields, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
};

const syncUserFromClerkApi = async (userId) => {
  const clerkUser = await clerkClient.users.getUser(userId);

  const email =
    clerkUser.emailAddresses?.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ||
    clerkUser.emailAddresses?.[0]?.emailAddress ||
    "";

  const fields = buildUserFields({
    userId,
    email,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    image: clerkUser.imageUrl,
  });

  return User.findByIdAndUpdate(userId, fields, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
};

const ensureUserInDb = async (userId, sessionClaims) => {
  let user = await User.findById(userId);
  if (user) return user;

  try {
    user = await syncUserFromSessionClaims(userId, sessionClaims);
    if (user) return user;
  } catch (error) {
    console.warn("Session-claims user sync failed:", error.message);
  }

  try {
    return await syncUserFromClerkApi(userId);
  } catch (error) {
    console.warn("Clerk API user sync failed:", error.message);
    return User.findByIdAndUpdate(
      userId,
      buildUserFields({ userId }),
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

/** Resolve Clerk auth from middleware or Bearer token (SPA on port 5173). */
const resolveAuth = async (req) => {
  const fromMiddleware = getAuth(req);
  if (fromMiddleware.userId) return fromMiddleware;

  const bearer = getBearerToken(req);
  if (!bearer) return fromMiddleware;

  // Direct JWT verification — most reliable for React SPA → Express API
  try {
    const payload = await verifyToken(bearer, {
      secretKey: process.env.CLERK_SECRET_KEY,
      authorizedParties: AUTHORIZED_PARTIES,
      // Tolerate ~1–2 min clock drift between PC and Clerk (nbf errors in dev)
      clockSkewInMs: 120_000,
    });
    if (payload?.sub) {
      return { userId: payload.sub, sessionClaims: payload };
    }
  } catch (error) {
    console.warn("verifyToken failed:", error.message);
  }

  try {
    const state = await authenticateRequest({
      clerkClient,
      request: req,
      options: clerkMiddlewareOptions,
    });
    const auth = state.toAuth();
    if (auth.userId) return auth;
  } catch (error) {
    console.warn("authenticateRequest failed:", error.message);
  }

  return fromMiddleware;
};

export const protect = async (req, res, next) => {
  try {
    const auth = await resolveAuth(req);
    const { userId, sessionClaims } = auth;

    if (!userId) {
      const bearer = getBearerToken(req);
      console.warn("Auth rejected:", {
        path: req.path,
        hasBearer: Boolean(bearer),
        hint: bearer
          ? "Token invalid or wrong Clerk keys — sign out/in on http://localhost:5173"
          : "No Bearer token — sign in first",
      });
      return res.json({ success: false, message: "not authenticated" });
    }

    req.user = await ensureUserInDb(userId, sessionClaims);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};
