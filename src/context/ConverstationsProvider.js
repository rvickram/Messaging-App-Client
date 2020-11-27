import React, { useContext, useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage';
import { useContacts } from './ContactsProvider'

const ConversationsContext = React.createContext()

export function useConversations() {
  return useContext(ConversationsContext)
}

export function ConversationsProvider({ children, id }) {
  const [conversations, setConversations] = useLocalStorage('conversations', [])
  const [selectedConversationIndex, setSelectedConversationIndex] = useState(0)
  const { contacts } = useContacts()

  function createConversation(recipients) {
    setConversations(prevConversations => {
      return [...prevConversations, { recipients, messages: [] }]
    })
  }

  function addMessageToConversation({ recipients, text, sender}) {
    setConversations(prevConversations => {
      let madeChange = false
      const newMessage = { sender, text }
      const newConversations = prevConversations.map(conversation => {
        if (arrayEquality(conversation.recipients, recipients)) {
          // if the conversation already exists, add a message to it

          madeChange = true
          return {
            ...conversation,
            messages: [...conversation.messages, newMessage]
          }
        }

        // otherwise, return the same convo
        return conversation
      })

      if (madeChange) {
        // found a convo, add message
        return newConversations
      } else {
        // create a new convo
        return [...prevConversations, { recipients, messages: [newMessage]}]
      }
    })
  }

  function sendMessage(recipients, text) {
    addMessageToConversation({ recipients, text, sender: id})
  }

  // format messages
  const formattedConversations = conversations.map((conversation, index) => {
      const recipients = conversation.recipients.map(recipient => {
          const contact = contacts.find(contact => {
              return contact.id === recipient
          })

          const name = (contact && contact.name) || recipient
          return { id: recipient, name }
      })

      const messages = conversation.messages.map(message => {
        const contact = contacts.find(contact => {
          return contact.id === message.sender
        })
        const name = (contact && contact.name) || message.sender

        const fromMe = id === message.sender

        return { ...message, senderName: name, fromMe}
      })

      const selected = index === selectedConversationIndex
      return { ...conversation, messages, recipients, selected }
  })

  const value = {
    conversations: formattedConversations,
    selectedConversation: formattedConversations[selectedConversationIndex],
    sendMessage,
    selectedConversationIndex: setSelectedConversationIndex,
    createConversation
  }

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  )
}

function arrayEquality(a, b) {
  if (a.length !== b.length) return false

  a.sort()
  b.sort()

  return a.every((elmt, index) => {
    return elmt === b[index]
  })
}