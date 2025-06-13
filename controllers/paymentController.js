const Stripe = require('stripe');
const { createPendingLesson, updateLessonStatus } = require('../models/Lesson');
const stripe = Stripe('sk_test_fvYpe6YuUWAQmCrryCFxoIMd00PTBsErny');
 
exports.createCheckoutSession = async (req, res) => {
  try {
    const { tutor_id, student_id, start_time, end_time, price ,selectedDate} = req.body;

    // 1. Create a pending lesson
    const meeting_url = "https://meet.example.com/" + Date.now(); // Example
    const lesson = await createPendingLesson({
      tutor_id,
      student_id,
      start_time,
      end_time,
      price,
      meeting_url,
      selectedDate
    });

    // 2. Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Lesson Booking',
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:3000/payment-success?lessonId=${lesson.id}`,
      cancel_url: `http://localhost:3000/payment-failed?lessonId=${lesson.id}`,
      metadata: {
        lessonId: lesson.id,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

// ✅ Confirm payment status from frontend
exports.confirmPaymentSuccess = async (req, res) => {
  const { lessonId ,status} = req.body;
  try {
    const updatedLesson = await updateLessonStatus(lessonId, status);
    res.json({ message: 'Payment confirmed', lesson: updatedLesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
};
