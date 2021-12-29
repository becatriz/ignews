import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
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
  const router = useRouter()

  async function handleSubscribe() {
    seIsLoading(true)

    if (!session) {
      signIn("github");
      return;
    }

    if (session.activeSubscription) {
      router.push("/posts")
      return
    }

    // Criacao de checkout session do strapi
    try {
    
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
