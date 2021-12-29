import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripe-js";

import styles from "./styles.module.scss";

interface SubscribeButtonProps {
  priceId: String;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const { data: session } = useSession(); 
  const [isLoading, seIsLoading] = useState(false)

  async function handleSubscribe() {
    if (!session) {
      signIn("github");
      return;
    }

    // Criacao de checkout session do strapi
    try {
      seIsLoading(true)

      const response = await api.post("/subscribe");

      const { sessionId } = response.data;     

      const stripe = await getStripeJs();

      await stripe.redirectToCheckout({ sessionId });

    } catch (error) {
      alert(error.message);
    }finally{
      seIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      {isLoading ? "Loading..." : "Subscribe now"}
    </button>
  );
}
