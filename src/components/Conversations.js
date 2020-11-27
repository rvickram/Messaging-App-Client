import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { useConversations } from '../context/ConverstationsProvider'

export default function Conversations() {
    const { conversations, selectedConversationIndex } = useConversations()

    return (
        <ListGroup variant="flush">
            {conversations.map((conversation, index) => (
                <ListGroup.Item 
                    key={index}
                    action
                    onClick={() => selectedConversationIndex(index)}
                    active={conversation.selected}
                >
                    {conversation.recipients.map(r => r.name).join(', ')}
                </ListGroup.Item>
            ))}
        </ListGroup>
    )
}
