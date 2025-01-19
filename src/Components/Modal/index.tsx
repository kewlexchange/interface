import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

const CustomModal = ({ isShowing, hide, header = null, closable, children }) => {
    const { isOpen, onOpen, onOpenChange ,isControlled,onClose} = useDisclosure();

    const onChange = ()=>{
        if(isShowing){
            hide();
        }
    }

    return       <Modal 

    backdrop={"blur"} size='3xl' placement='center' isDismissable={false} hideCloseButton={!closable} isOpen={isShowing} onOpenChange={onChange}>
    <ModalContent>
                <ModalHeader className="flex flex-col gap-1 py-2">{header}</ModalHeader>
                <ModalBody className='px-1 py-1'> 
                    {children}
                </ModalBody>
           
     
    </ModalContent>
</Modal>
        
}

export default CustomModal
