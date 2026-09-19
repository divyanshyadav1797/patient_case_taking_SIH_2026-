import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctor } from '../context/DoctorContext';

export default function MessagesPage() {
  const navigate = useNavigate();
  const {
    chats,
    activeChatId,
    setActiveChatId,
    sendChatMessage,
    patients,
    setSelectedPatient
  } = useDoctor();

  const [messageInput, setMessageInput] = useState('');
  const [convoSearch, setConvoSearch] = useState('');

  const activeChat = chats.find((c) => c.patientId === activeChatId) || chats[0];

  const filteredChats = chats.filter((c) => {
    if (!convoSearch.trim()) return true;
    return c.patientName.toLowerCase().includes(convoSearch.toLowerCase());
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendChatMessage(messageInput);
    setMessageInput('');
  };

  const handleViewPatient = () => {
    if (!activeChat) return;
    const p = patients.find((pat) => pat.id === activeChat.patientId);
    if (p) setSelectedPatient(p);
    navigate('/patients');
  };

  return (
    <section id="viewMessages" className="page-view active" role="region" aria-label="Messages View">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-heading">Messages</h1>
          <p className="page-subheading">Direct clinical communications with patients.</p>
        </div>
      </div>

      <div className="chat-container">
        {/* Left: Conversation List */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <input
              type="text"
              id="conversationSearchInput"
              className="chat-search-input"
              placeholder="Search conversations..."
              value={convoSearch}
              onChange={(e) => setConvoSearch(e.target.value)}
            />
          </div>
          <ul className="conversation-list" id="conversationList">
            {filteredChats.map((chat) => (
              <li
                key={chat.patientId}
                className={`conversation-item ${chat.patientId === activeChatId ? 'active' : ''}`}
                onClick={() => setActiveChatId(chat.patientId)}
                style={{ cursor: 'pointer' }}
              >
                <div className="convo-avatar">{chat.avatar}</div>
                <div className="convo-details">
                  <div className="convo-top-row">
                    <span className="convo-name">{chat.patientName}</span>
                    <span className="convo-time">{chat.lastTime}</span>
                  </div>
                  <div className="convo-bottom-row">
                    <span className="convo-preview">
                      {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : 'No messages'}
                    </span>
                    {chat.unread > 0 && <span className="convo-unread-badge">{chat.unread}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Active Chat */}
        <div className="chat-main">
          {activeChat ? (
            <>
              <div className="chat-header">
                <div className="chat-header-patient">
                  <div className="convo-avatar" id="chatActiveAvatar">{activeChat.avatar}</div>
                  <div>
                    <h3 className="chat-header-name" id="chatActiveName">{activeChat.patientName}</h3>
                    <span className="chat-header-status">
                      {activeChat.status} · General Patient
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-outline"
                  id="chatViewPatientBtn"
                  onClick={handleViewPatient}
                >
                  View Profile
                </button>
              </div>

              {/* Message Bubbles Thread */}
              <div className="chat-messages" id="chatMessages">
                {activeChat.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-bubble-wrap ${msg.sender === 'doctor' ? 'outgoing' : 'incoming'}`}
                  >
                    <div className={`chat-bubble ${msg.sender === 'doctor' ? 'bubble-doctor' : 'bubble-patient'}`}>
                      <p className="bubble-text">{msg.text}</p>
                      <span className="bubble-time">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form className="chat-input-bar" id="chatForm" onSubmit={handleSend}>
                <input
                  type="text"
                  id="chatInput"
                  className="chat-input"
                  placeholder="Type a message..."
                  autoComplete="off"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button type="submit" className="chat-send-btn" aria-label="Send message">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
              Select a conversation to start chatting.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
