import { Suspense } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChatScreen } from "./ChatScreen";

export default function ChatPage() {
  return (
    <Suspense fallback={<PhoneFrame>{null}</PhoneFrame>}>
      <ChatScreen />
    </Suspense>
  );
}
