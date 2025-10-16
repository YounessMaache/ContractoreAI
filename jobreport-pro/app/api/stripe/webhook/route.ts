import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Log the event
  await supabase.from('stripe_events').insert({
    event_id: event.id,
    type: event.type,
    data: event.data,
  })

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata.userId

      if (userId) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            subscription_plan: 'pro',
            subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', userId)
      }
      break

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription
      const deletedUserId = deletedSubscription.metadata.userId

      if (deletedUserId) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_plan: 'free',
          })
          .eq('id', deletedUserId)
      }
      break

    case 'invoice.paid':
      const invoice = event.data.object as Stripe.Invoice
      // Handle successful payment
      break

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice
      // Handle failed payment
      break
  }

  return NextResponse.json({ received: true })
}
