import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { XCircle, Mail } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  sendPasswordReset: (email: string) => Promise<void>;
  onSnackbar: (message: string, type: "success" | "error") => void;
}
const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  setIsOpen,
  sendPasswordReset,
  onSnackbar, 
}) => {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!email) {
      onSnackbar("Please enter an email.", "error");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      onSnackbar("Password reset email sent successfully!", "success");
      closeModal();
    } catch (error) {
      onSnackbar("Failed to send reset email. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center justify-between"
                >
                  Reset Password
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </DialogTitle>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    Enter your email address to receive a password reset link.
                  </p>
                  <div className="mt-4 relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full px-4 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-white border rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-600"
                    />
                    <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isLoading ? "Sending..." : "Send Reset Email"}
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ForgotPasswordModal;

function onSnackbar(arg0: string, arg1: string) {
  throw new Error("Function not implemented.");
}
