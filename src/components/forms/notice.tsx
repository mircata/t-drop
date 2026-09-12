/* WooCommerce-style notices used above the account forms. Rendered only when there is a message. */
export function ErrorNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mb-5 rounded-[3px] border-t-[3px] border-[#b81c23] bg-[#f7f6f7] px-4 py-3 font-roboto text-[14px] leading-[1.6] text-[#515151]">
      {message}
    </p>
  );
}

export function InfoNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="status" className="mb-5 rounded-[3px] border-t-[3px] border-[#5bc0de] bg-[#f7f6f7] px-4 py-3 font-roboto text-[14px] leading-[1.6] text-[#515151]">
      {message}
    </p>
  );
}
