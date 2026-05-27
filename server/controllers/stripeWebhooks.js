import Stripe from 'stripe'
import Booking from '../models/Booking.js'

const markBookingPaid = async (bookingId) => {
  if (!bookingId) {
    console.error('Stripe webhook: missing bookingId in metadata')
    return false
  }

  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      isPaid: true,
      paymentMethod: 'Stripe',
      status: 'confirmed',
    },
    { new: true }
  )

  if (!booking) {
    console.error('Stripe webhook: booking not found:', bookingId)
    return false
  }

  return true
}

// API to handle Stripe Webhooks
export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
  const sig = request.headers['stripe-signature']

  let event

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      if (session.payment_status === 'paid') {
        await markBookingPaid(session.metadata?.bookingId)
      }
    } else if (event.type === 'payment_intent.succeeded') {
      // Fallback for older webhook configs
      const paymentIntentId = event.data.object.id
      const { data: sessions } = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      })

      const session = sessions[0]
      if (session?.metadata?.bookingId) {
        await markBookingPaid(session.metadata.bookingId)
      }
    } else {
      console.log(`Unhandled event type ${event.type}`)
    }

    response.json({ received: true })
  } catch (err) {
    console.error('Stripe webhook handler error:', err.message)
    response.status(500).json({ error: 'Webhook handler failed' })
  }
}
