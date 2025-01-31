import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

const CustomModal = ({ isShowing, hide, header = null, closable, children }) => {
    const { isOpen, onOpen, onOpenChange ,isControlled,onClose} = useDisclosure();

    const onChange = ()=>{
        if(isShowing){
            hide();
        }
    }

    return (
        <Modal
            backdrop="blur"
            size="3xl"
            placement="center"
            isDismissable={false}
            hideCloseButton={!closable}
            isOpen={isShowing}
            onOpenChange={onChange}
            classNames={{
                base: "border-1 border-violet-500/10 dark:border-violet-400/10 bg-white/50 dark:bg-black/40 backdrop-blur-xl",
                header: "border-b-1 border-violet-500/10 dark:border-violet-400/10",
                footer: "border-t-1 border-violet-500/10 dark:border-violet-400/10",
                closeButton: "hover:bg-violet-500/10 active:bg-violet-500/20",
                backdrop: "backdrop-blur-sm bg-violet-500/[0.02]"
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex items-center justify-between py-3 px-6">
                            <span className="text-lg font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 text-transparent bg-clip-text">
                                {header}
                            </span>
                        </ModalHeader>
                        <ModalBody className="relative py-4 px-6">
                            {/* Glow effect */}
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-2xl opacity-50 blur-md" />
                            
                            {/* Content */}
                            <div className="relative text-violet-600/70 dark:text-violet-300/70">
                                {children}
                            </div>
                        </ModalBody>
                        {closable && (
                            <ModalFooter className="py-3 px-6">
                                <Button
                                    variant="light"
                                    onPress={onClose}
                                    radius="full"
                                    size="sm"
                                    className="bg-violet-500/10 backdrop-blur-xl
                                        border border-violet-500/30
                                        text-violet-500 hover:text-violet-400
                                        rounded-full
                                        shadow-[0_0_15px_rgba(139,92,246,0.3)]
                                        hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]
                                        transition-all duration-500
                                        group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0
                                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    <span className="relative">
                                        Close
                                    </span>
                                </Button>
                            </ModalFooter>
                        )}
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default CustomModal
