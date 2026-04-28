"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Pin } from "lucide-react";
import { removeThreadMember, pinThreadMessage } from "@/lib/thread-actions";

type Props =
  | {
      variant: "kick";
      threadId: string;
      memberUserId: string;
      memberHandle: string;
    }
  | {
      variant: "pin";
      threadId: string;
      messageId: string;
    }
  | {
      variant: "unpin";
      threadId: string;
      messageId: null;
    };

export function ThreadCreatorTools(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (props.variant === "kick") {
    return (
      <button
        type="button"
        onClick={() => {
          if (!confirm(`remove @${props.memberHandle} from this thread?`)) return;
          startTransition(async () => {
            await removeThreadMember({
              threadId: props.threadId,
              memberUserId: props.memberUserId,
            });
            router.refresh();
          });
        }}
        disabled={pending}
        aria-label={`Remove @${props.memberHandle}`}
        className="ml-1 text-muted hover:text-warn transition disabled:opacity-30"
      >
        <X size={11} strokeWidth={2} />
      </button>
    );
  }

  if (props.variant === "pin") {
    return (
      <button
        type="button"
        onClick={() => {
          startTransition(async () => {
            await pinThreadMessage({
              threadId: props.threadId,
              messageId: props.messageId,
            });
            router.refresh();
          });
        }}
        disabled={pending}
        aria-label="Pin message"
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-paper/50 hover:text-paper transition disabled:opacity-30"
      >
        <Pin size={12} strokeWidth={1.8} />
      </button>
    );
  }

  // unpin
  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await pinThreadMessage({
            threadId: props.threadId,
            messageId: null,
          });
          router.refresh();
        });
      }}
      disabled={pending}
      aria-label="Unpin message"
      className="ml-2 text-muted hover:text-warn transition disabled:opacity-30"
    >
      <X size={11} strokeWidth={2} />
    </button>
  );
}
