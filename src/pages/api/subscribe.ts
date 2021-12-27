/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { stripe } from "../../services/stripe";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    // pegar dados do user no server e nao mais no cliente
    const session = await getSession({ req });

    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
    });

    const stripeCheckoutSesstion = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id, // id no sripe e nao do faunadb
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      line_items: [{ price: "price_1KB3DxKdiBh9MGT8hCj2dyYN", quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return res.status(200).json({sessionId: stripeCheckoutSesstion});
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};
