import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

const CustomModal = ({ isShowing, hide, header = null, closable, children }) => {
    const { isOpen, onOpen, onOpenChange ,isControlled,onClose} = useDisclosure();

    const onChange = ()=>{
        if(isShowing){
            hide();
        }
    }

    return       <Modal  size='2xl' backdrop='blur' placement='center' isDismissable={false} hideCloseButton={!closable} isOpen={isShowing} onOpenChange={onChange}>
    <ModalContent>
                <ModalHeader className="flex flex-col gap-1">{header}</ModalHeader>
                <ModalBody>
                    {children}
                </ModalBody>
           
     
    </ModalContent>
</Modal>
        
}

export default CustomModal
