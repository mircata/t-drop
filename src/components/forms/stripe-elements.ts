import { type Appearance, loadStripe } from "@stripe/stripe-js";

/* One Stripe.js per page, shared by the two places that embed the Payment Element:
   /account/payment (a SetupIntent, to change the card) and the signup funnel's payment
   step (the first invoice's PaymentIntent). Null when no publishable key is configured. */
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export const stripeFonts = [{ cssSrc: "https://fonts.googleapis.com/css2?family=Handjet&display=swap" }];

/**
 * Mirrors the shared field style (forms/field.tsx): Handjet labels over 6px-rounded grey
 * inputs with a red border. Stripe renders in its own iframe, so our Tailwind classes can't
 * reach it — this is the only way to match. `labelSize` is 16 for the account pages'
 * "DELIVERY page states" fields and 18 for the signup funnel's.
 */
export function stripeAppearance(labelSize: 16 | 18 = 16): Appearance {
  return {
    variables: {
      colorPrimary: "#cc0e45",
      colorText: "#212121",
      colorBackground: "#eaeaea",
      colorDanger: "#cc0e45",
      borderRadius: "6px",
      fontFamily: "Handjet, sans-serif",
      fontSizeBase: "18px",
    },
    rules: {
      ".Input": { border: "1px solid #cc0e45", boxShadow: "none", padding: "13px 16px" },
      ".Input:focus": { border: "2px solid #cc0e45", boxShadow: "none" },
      ".Label": { fontSize: `${labelSize}px`, color: "#212121", marginBottom: "10px" },
      ".Tab": { border: "1px solid #cc0e45", boxShadow: "none" },
      ".AccordionItem": { backgroundColor: "transparent", border: "none", boxShadow: "none", paddingLeft: "0", paddingRight: "0" },
    },
  };
}
