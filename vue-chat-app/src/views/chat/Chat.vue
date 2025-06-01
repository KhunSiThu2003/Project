<template>
  <section 
    class="flex w-full h-screen bg-gray-50 dark:bg-gray-900"
    @click="handleUserInteraction"
    @keydown="handleUserInteraction"
    @touchstart="handleUserInteraction"
  >
    <!-- Friends Sidebar -->
    <div 
      :class="[
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col',
        'fixed md:pt-0 pt-16 md:relative inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out',
        'md:w-72 w-full',
        showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800 dark:text-white">Messages</h2>
        </div>
        <div class="relative mt-3">
          <input
            v-model="friendSearch"
            type="text"
            :placeholder="t('chat.searchFriends')"
            class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"
          />
          <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      
      <!-- Friends List -->
      <div class="flex-1 overflow-y-auto relative">
        <button class="fixed bottom-3 right-3">
          <router-link to="/find-friends" class="flex items-center space-x-3 px-4 py-3 rounded-xl"
          :class="{ 'active': $route.path === '/find-friends' }">
          <span
            class="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700/50 group-[.active]:bg-primary-500/10">
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 group-[.active]:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </span>
        </router-link>
        </button>
        <!-- Loading State -->
        <div v-if="loading && !friends.length" class="flex flex-col items-center justify-center h-full">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          <p class="mt-2 text-gray-500">{{ t('chat.loadingFriends') }}</p>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="!filteredFriends.length && !pendingRequests.length" class="flex flex-col items-center justify-center h-full text-gray-400">
          <i class="far fa-comment-dots text-4xl mb-3"></i>
          <p>{{ friendSearch ? t('chat.noMatchesFound') : t('chat.friendsWillAppear') }}</p>
        </div>
        
        <!-- Friend Requests -->
        <div v-if="pendingRequests.length > 0" class="p-3 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Friend Requests</h3>
          <div class="space-y-2">
            <div 
              v-for="request in pendingRequests" 
              :key="request.id"
              class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2"
            >
              <div class="flex items-center space-x-2">
                <img 
                  :src="request.photoURL || '/default-avatar.png'" 
                  class="w-8 h-8 rounded-full object-cover"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {{ request.displayName }}
                  </p>
                </div>
                <div class="flex space-x-1">
                  <button 
                    @click="acceptFriendRequest(request)"
                    class="p-1 text-green-500 hover:text-green-600 dark:hover:text-green-400"
                    title="Accept"
                  >
                    <CheckIcon class="w-5 h-5" />
                  </button>
                  <button 
                    @click="rejectFriendRequest(request)"
                    class="p-1 text-red-500 hover:text-red-600 dark:hover:text-red-400"
                    title="Reject"
                  >
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Friends List -->
        <div v-if="filteredFriends.length" class="divide-y divide-gray-200 dark:divide-gray-700">
          <div 
            v-for="friend in filteredFriends" 
            :key="friend.id"
            class="group relative friend-item"
          >
            <div
              @click="startChat(friend)"
              class="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              :class="{'bg-gray-100 dark:bg-gray-700': currentChat?.otherUser?.id === friend.id}"
            >
              <div class="relative mr-3">
                <img 
                  :src="friend.photoURL || '/default-avatar.png'" 
                  class="w-12 h-12 rounded-full object-cover border-2"
                  :class="isOnline(friend.id) ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'"
                />
                <div 
                  class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800"
                  :class="isOnline(friend.id) ? 'bg-green-500' : 'bg-gray-400'"
                ></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center">
                  <h3 class="font-medium text-gray-900 dark:text-white truncate">{{ friend.displayName }}</h3>
                  <span class="text-xs text-gray-500">
                    {{ lastMessageTime(friend.lastMessage) }}
                  </span>
                </div>
                <div class="flex items-center mt-1">
                  <p class="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center">
                    <span v-if="friend.lastMessage?.senderId === currentUser?.uid" class="mr-1">{{ t('chat.you') }}: </span>
                    <span v-else-if="friend.lastMessage?.senderId === friend.id" class="mr-1">{{ friend.displayName }}: </span>
                    <span v-if="friend.lastMessage?.edited" class="text-xs text-gray-400 mr-1">({{ t('chat.messageEdited') }}) </span>
                    {{ getLastMessagePreview(friend) }}
                  </p>
                  <span v-if="friend.unreadCount" class="ml-2 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {{ friend.unreadCount }}
                  </span>
                </div>
                <div class="text-xs mt-1" :class="isOnline(friend.id) ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'">
                  <template v-if="isOnline(friend.id)">
                    <i class="fas fa-circle text-xs mr-1"></i>
                    {{ t('chat.online') }}
                  </template>
                  <template v-else>
                    <i class="fas fa-clock text-xs mr-1"></i>
                    {{ formatLastSeen(friend.id) }}
                  </template>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col bg-white dark:bg-gray-800 md:relative">
      <!-- Chat Header -->
      <div v-if="currentChat" class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-3">
          <button @click="toggleSidebar" class="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <!-- Profile Link -->
          <router-link 
            :to="`/profile/${currentChat.otherUser?.id}`"
            class="relative inline-block cursor-pointer hover:opacity-90 transition-opacity"
          >
            <img 
              :src="currentChat.otherUser?.photoURL || '/default-avatar.png'" 
              class="w-10 h-10 rounded-full border-2"
              :class="[
                isOnline(currentChat.otherUser?.id) ? 'border-green-500' : 'border-gray-300 dark:border-gray-600',
                {'ml-0': !showSidebar && isMobile}
              ]"
            />
            <div
              class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800"
              :class="isOnline(currentChat.otherUser?.id) ? 'bg-green-500' : 'bg-gray-400'"
            ></div>
          </router-link>

          <div>
            <router-link 
              :to="`/profile/${currentChat.otherUser?.id}`"
              class="hover:underline"
            >
              <h2 class="font-semibold text-base text-gray-900 dark:text-white">
                {{ currentChat.otherUser?.displayName }}
              </h2>
            </router-link>
            <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <div v-if="currentChat.otherUser?.isTyping" class="typing-status">
                <div class="typing-dots">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
              </div>
              <template v-else>
                <span v-if="isOnline(currentChat.otherUser?.id)" class="online-status">
                  <span class="dot"></span>
                  <span>Online</span>
                </span>
                <span v-else class="last-seen">
                  {{ formatLastSeen(currentChat.otherUser?.id) }}
                </span>
              </template>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-4" :class="{'md:flex hidden': !showSidebar}">
          <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <PhoneIcon class="w-5 h-5" />
          </button>
          <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <VideoCameraIcon class="w-5 h-5" />
          </button>
          <div class="relative chat-menu">
            <button 
              @click="toggleChatMenu"
              class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <EllipsisVerticalIcon class="w-5 h-5" />
            </button>
            
            <!-- Chat Menu Dropdown -->
            <div 
              v-if="showChatMenu"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50"
              @click.stop
            >
              <router-link 
                :to="`/profile/${currentChat.otherUser?.id}`"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <UserIcon class="w-4 h-4 inline-block mr-2" />
                {{ t('profile.viewProfile') }}
              </router-link>

              <button 
                @click="blockUser"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <NoSymbolIcon class="w-4 h-4 inline-block mr-2" />
                {{ isBlocked ? t('chat.unblockUser') : t('chat.blockUser') }}
              </button>

              <button 
                @click="deleteConversation"
                class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <TrashIcon class="w-4 h-4 inline-block mr-2" />
                {{ t('chat.deleteConversation') }}
              </button>

              <button 
                @click="removeFriend"
                class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <UserMinusIcon class="w-4 h-4 inline-block mr-2" />
                {{ t('friends.removeFriend') }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center h-full text-gray-400">
        <i class="far fa-comments text-5xl mb-4 opacity-30"></i>
        <h3 class="text-xl font-medium text-gray-500 mb-2">Select a conversation</h3>
        <p class="text-gray-400">Choose a friend to start chatting</p>
      </div>

      <!-- Messages Area -->
      <div 
        v-if="currentChat"
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 scroll-smooth"
      >
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
        
        <!-- Messages -->
        <div v-else class="space-y-4">
          <div 
            v-for="message in messages"
            :key="message.id"
            :class="[
              'flex message-container',
              message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'
            ]"
           @contextmenu.prevent="showMessageMenuForMessage(message, $event)"
          >
        
            <!-- Sender Profile (for received messages) -->
            <div v-if="message.senderId !== currentUser.uid" class="flex-shrink-0 mr-2">
              <div class="relative">
                <img 
                  :src="currentChat.otherUser?.photoURL || '/default-avatar.png'" 
                  class="w-8 h-8 rounded-full object-cover border-2"
                  :class="isOnline(currentChat.otherUser?.id) ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'"
                />
                <div 
                  class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800"
                  :class="isOnline(currentChat.otherUser?.id) ? 'bg-green-500' : 'bg-gray-400'"
                ></div>
              </div>
            </div>

            <!-- Message Content -->
            <div class="flex flex-col max-w-[75%]">
              <!-- Sender Name (for received messages) -->
              <div v-if="message.senderId !== currentUser.uid" class="mb-1">
                <span class="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {{ currentChat.otherUser?.displayName }}
                </span>
              </div>

              <!-- Message Bubble -->
              <div 
                :class="[
                  'message-bubble',
                  message.senderId === currentUser.uid 
                    ? 'sent-bubble' 
                    : 'received-bubble'
                ]"
                @click="showMessageMenuForMessage(message, $event)"
              >
                <!-- Message Content -->
                <template v-if="editingMessage?.id === message.id">
                  <div class="edit-message-container">
                    <input
                      v-model="editedMessageContent"
                      @keyup.enter="saveEditedMessage"
                      @keyup.esc="cancelEditing"
                      class="edit-message-input"
                      type="text"
                      :placeholder="t('chat.editMessage')"
                    />
                    <div class="edit-message-actions">
                      <button 
                        @click="saveEditedMessage"
                        class="edit-message-button save"
                        :title="t('chat.save')"
                      >
                        <CheckIcon class="w-4 h-4" />
                      </button>
                      <button 
                        @click="cancelEditing"
                        class="edit-message-button cancel"
                        :title="t('chat.cancel')"
                      >
                        <XMarkIcon class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <template v-if="message.type === 'sticker'">
                    <img :src="message.content" :alt="t('chat.sticker')" class="w-24 h-24 object-contain" />
                  </template>
                  <template v-else>
                    <p class="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {{ message.content }}
                      <span v-if="message.edited" class="text-xs text-gray-500 ml-1">(edited)</span>
                    </p>
                  </template>
                </template>

                <!-- Message Footer -->
                <div class="flex items-center justify-end mt-1.5 space-x-2">
                  <span class="text-xs opacity-80 font-medium">
                    {{ formatTime(message.timestamp) }}
                  </span>
                  <span v-if="message.senderId === currentUser.uid" class="flex items-center">
                    <i 
                      v-if="message.read" 
                      class="fas fa-check-double text-xs text-blue-300"
                      title="Read"
                    ></i>
                    <i 
                      v-else 
                      class="fas fa-check text-xs text-gray-300"
                      title="Delivered"
                    ></i>
                  </span>
                </div>
                
                <!-- Message Reactions -->
                <div 
                  v-if="message.reactions && Object.keys(message.reactions).length > 0" 
                  class="reactions-container"
                >
                  <div 
                    v-for="(users, reaction) in message.reactions"
                    :key="reaction"
                    class="reaction-group relative"
                    @click="removeReaction(message.id, reaction)"
                  >
                    <span class="reaction-emoji">{{ reaction }}</span>
                    <div class="reaction-users absolute top-0 left-0">
                      <div 
                        v-for="userId in users" 
                        :key="userId"
                        class="reaction-user-avatar"
                        :title="getUserDisplayName(userId)"
                      >
                        <img 
                          :src="getUserPhotoURL(userId) || '/default-avatar.png'" 
                          :alt="getUserDisplayName(userId)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Reaction Button -->
                <button
                  v-if="!showReactionPicker || showReactionPicker !== message.id"
                  @click="showReactionPickerForMessage(message, $event)"
                  class="reaction-button"
                  title="Add reaction"
                >
                  <FaceSmileIcon class="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <!-- Sender Profile (for sent messages) -->
            <div v-if="message.senderId === currentUser.uid" class="flex-shrink-0 ml-2">
              <div class="relative">
                <img 
                  :src="currentUser?.photoURL || '/default-avatar.png'" 
                  class="w-8 h-8 rounded-full object-cover border-2"
                  :class="isOnline(currentUser.uid) ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'"
                />
                <div 
                  class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800"
                  :class="isOnline(currentUser.uid) ? 'bg-green-500' : 'bg-gray-400'"
                ></div>
              </div>
            </div>
         

          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div v-if="currentChat" class="p-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-2">
          <button 
            @click="$refs.fileInput.click()"
            class="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <PaperClipIcon class="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref="fileInput" 
            class="hidden" 
            @change="handleFileUpload"
            accept="image/*,.pdf,.doc,.docx"
          />
          <div class="flex-1 relative">
            <input
              v-model="newMessage"
              @keydown.enter="sendMessage"
              @input="handleTyping"
              type="text"
              :placeholder="t('chat.typeMessage')"
              class="w-full pl-4 pr-24 py-3 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white input-focus"
            />
            
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <button 
                @click="toggleEmojiPicker"
                class="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FaceSmileIcon class="w-5 h-5" />
              </button>
              <button 
                @click="toggleStickerPicker"
                class="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <PhotoIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim()"
            class="send-button"
            :class="{'opacity-50 cursor-not-allowed': !newMessage.trim()}"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              class="send-icon"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Message Context Menu -->
    <div v-if="showMessageMenu" class="fixed bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-50">
      <button 
        v-if="showMessageMenu.senderId === currentUser.uid"
        @click="handleMessageAction(showMessageMenu, 'edit')"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
      >
        <PencilSquareIcon class="w-5 h-5 inline-block mr-2" /> {{ t('chat.edit') }}
      </button>
      <button 
        @click="deleteMessage(showMessageMenu)"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
      >
        <TrashIcon class="w-5 h-5 inline-block mr-2" /> {{ t('chat.delete') }}
      </button>
    </div>

    <!-- Reaction Picker -->
    <div 
      v-if="showReactionPicker"
      class="fixed bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-50"
      :style="{
        left: `${reactionPickerPosition.x}px`,
        top: `${reactionPickerPosition.y}px`
      }"
    >
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Add Reaction</h3>
        <button 
          @click="showReactionPicker = null"
          class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
      <div class="grid grid-cols-6 gap-2">
        <button 
          v-for="emoji in emojis"
          :key="emoji"
          @click="addReaction(showReactionPicker, emoji)"
          class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xl transition-colors"
        >
          {{ emoji }}
        </button>
      </div>
    </div>

    <!-- Sticker Picker -->
    <StickerPicker
      v-if="showStickerPicker"
      :show="showStickerPicker"
      :position="stickerPickerPosition"
      @close="showStickerPicker = false"
      @select="sendSticker"
    />

    <!-- Emoji Picker -->
    <EmojiPicker
      v-if="showEmojiPicker"
      :show="showEmojiPicker"
      :position="emojiPickerPosition"
      @close="showEmojiPicker = false"
      @select="insertEmoji"
    />

    <!-- Message Actions -->
    <div 
      v-if="showMessageMenu"
      class="message-actions"
      :style="{
        left: `${messageMenuPosition.x}px`,
        top: `${messageMenuPosition.y}px`
      }"
    >
      <button 
        v-if="showMessageMenu.senderId === currentUser.uid"
        @click="editMessage(showMessageMenu, newMessage)"
        class="action-button"
      >
        <PencilSquareIcon class="w-4 h-4" />
        Edit
      </button>
      <button 
        v-if="showMessageMenu.senderId === currentUser.uid"
        @click="deleteMessage(showMessageMenu)"
        class="action-button text-red-500"
      >
        <TrashIcon class="w-4 h-4" />
        Delete
      </button>
    </div>

    <!-- Overlay for mobile when sidebar is open -->
    <div 
      v-if="showSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
      @click="toggleSidebar"
    ></div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { collection, query, where, onSnapshot, getDocs, doc, getDoc, orderBy, limit, serverTimestamp, setDoc, addDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, ref as dbRef, onDisconnect, serverTimestamp as dbServerTimestamp, onValue, set } from 'firebase/database'
import { db } from '@/firebase'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { formatDistanceToNow } from 'date-fns'
import { useFriendsStore } from '@/stores/friends'
import { useI18n } from 'vue-i18n'

import { useUserStore } from '@/stores/user'
import { useActivityStore } from '@/stores/activity'
const activityStore = useActivityStore()

import { 
  PaperClipIcon, 
  PaperAirplaneIcon, 
  FaceSmileIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  UserMinusIcon,
  CheckIcon,
  XMarkIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  PhotoIcon,
  UserIcon,
  NoSymbolIcon
} from '@heroicons/vue/24/outline/index.js'

import StickerPicker from '@/components/StickerPicker.vue'
import EmojiPicker from '@/components/EmojiPicker.vue'
import { useLanguage } from '@/composables/useLanguage'

// Import sound files
import sendMessageSound from '@/assets/sounds/send-message.mp3'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const friendsStore = useFriendsStore()

const userStore = useUserStore()
const { t } = useI18n()

// Add messagesContainer ref
const messagesContainer = ref(null)

// Initialize required variables
const friends = ref([])
const loading = ref(true)
const friendSearch = ref('')
const currentChat = ref(null)
const currentUser = ref(null)
const messages = ref([])
const newMessage = ref('')
const showEmojiPicker = ref(false)
const emojis = ref([
  '😊', '😂', '❤️', '👍', '🎉', '🔥', '👏', '🙏', '🤔', '😎',
  '😢', '😡', '🤗', '🤫', '🤐', '🤯', '🥳', '😴', '🤮', '🤧',
  '😇', '🥰', '😍', '🤩', '😋', '🤤', '😷', '🤒', '🤕', '🤢'
])
const pendingRequests = ref([])
const sentRequests = ref([])

// Message action refs
const showMessageMenu = ref(null)
const editingMessage = ref(null)
const showReactionPicker = ref(null)
const reactionPickerPosition = ref({ x: 0, y: 0 })
const selectedMessages = ref([])
const showForwardModal = ref(false)
const forwardToChat = ref(null)
const showStickerPicker = ref(false)
const stickerPickerPosition = ref({ x: 0, y: 0 })
const emojiPickerPosition = ref({ x: 0, y: 0 })

// Add these refs for audio
const sendSound = ref(null)

// Add playSendSound function
const playSendSound = () => {
  if (sendSound.value) {
    sendSound.value.currentTime = 0
    sendSound.value.play().catch(error => {
      console.error('Error playing sound:', error)
    })
  }
}

// Add these refs for typing
const isTyping = ref(false)
const typingTimeout = ref(null)
const typingDebounceTime = 1000 // 1 second debounce

// Add these refs for presence
const onlineStatus = ref({})

// Add these refs at the top of the script with other refs
const userStatusRef = ref(null)
const userStatusDatabaseRef = ref(null)

// Store previous unread counts
const previousUnreadCounts = ref({})

// Add these refs at the top with other refs
const messagesUnsubscribe = ref(null)
const typingUnsubscribe = ref(null)
const statusUnsubscribe = ref(null)
const friendsUnsubscribe = ref(null)
const requestsUnsubscribe = ref(null)
const sentRequestsUnsubscribe = ref(null)

// Add these refs for message editing
const editedMessageContent = ref('')

// Add these refs at the top with other refs
const presenceRetryCount = ref(0)
const maxPresenceRetries = 3
const presenceRetryDelay = 2000 // 2 seconds

// Add chat menu ref
const showChatMenu = ref(false)

// Computed property for filtered friends
const filteredFriends = computed(() => {
  if (!friendSearch.value) return friends.value
  const search = friendSearch.value.toLowerCase()
  return friends.value.filter(friend => 
    friend.displayName.toLowerCase().includes(search)
  )
})

// Fetch current user
const auth = getAuth()
const fetchCurrentUser = async () => {
  const user = auth.currentUser
  if (user) {
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (userDoc.exists()) {
      currentUser.value = { uid: user.uid, ...userDoc.data() }
    }
  }
}

// Add userCache at the top with other refs
const userCache = ref({})

// Update the existing getUserData function
const getUserData = async (userId) => {
  if (userCache.value[userId]) {
    return userCache.value[userId]
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      userCache.value[userId] = userData
      return userData
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
  }
  return null
}

// Add after the getUserData function

// Helper function to get user display name
const getUserDisplayName = (userId) => {
  if (!userId) return ''
  
  // Check cache first
  if (userCache.value[userId]) {
    return userCache.value[userId].displayName || 'Unknown User'
  }
  
  // If not in cache, fetch and cache the user data
  getUserData(userId).then(userData => {
    if (userData) {
      userCache.value[userId] = userData
    }
  })
  
  return 'Loading...'
}

// Helper function to get user photo URL
const getUserPhotoURL = (userId) => {
  if (!userId) return '/default-avatar.png'
  
  // Check cache first
  if (userCache.value[userId]) {
    return userCache.value[userId].photoURL || '/default-avatar.png'
  }
  
  // If not in cache, fetch and cache the user data
  getUserData(userId).then(userData => {
    if (userData) {
      userCache.value[userId] = userData
    }
  })
  
  return '/default-avatar.png'
}

const setupRealtimeListeners = () => {
  // Friends listener
  const friendsRef = collection(db, 'friends')
  const friendsQuery = query(
    friendsRef,
    where('participants', 'array-contains', auth.currentUser.uid)
  )
  
  friendsUnsubscribe.value = onSnapshot(friendsQuery, async (snapshot) => {
    try {
      const friendsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data()
          const friendId = data.participants.find(id => id !== auth.currentUser.uid)
          const userData = await getUserData(friendId)
          
          // Get the chat ID for this friendship
          const chatId = [auth.currentUser.uid, friendId].sort().join('_')
          
          // Get the last message for this chat
          const messagesQuery = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('timestamp', 'desc'),
            limit(1)
          )
          
          const messagesSnapshot = await getDocs(messagesQuery)
          const lastMessage = messagesSnapshot.docs[0]?.data() || null
          
          // Get unread count
          const unreadQuery = query(
            collection(db, 'chats', chatId, 'messages'),
            where('read', '==', false),
            where('senderId', '==', friendId)
          )
          const unreadSnapshot = await getDocs(unreadQuery)
          const unreadCount = unreadSnapshot.size

          return {
            id: friendId,
            ...userData,
            friendshipId: doc.id,
            status: 'friend',
            lastMessage: lastMessage,
            unreadCount: unreadCount
          }
        })
      )
      friends.value = friendsData.filter(Boolean)
    } catch (error) {
      console.error('Error in friends listener:', error)
      showToast('error', 'Error', error.message)
    }
  })

  // Friend requests listeners
  const requestsRef = collection(db, 'friendRequests')
  
  // Received requests
  const requestsQuery = query(
    requestsRef,
    where('recipientId', '==', auth.currentUser.uid),
    where('status', '==', 'pending')
  )
  
  requestsUnsubscribe.value = onSnapshot(requestsQuery, async (snapshot) => {
    const requestsData = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data()
        const userData = await getUserData(data.senderId)
        return {
          id: doc.id,
          requestId: doc.id,
          senderId: data.senderId,
          recipientId: data.recipientId,
          ...userData,
          status: 'request'
        }
      })
    )
    pendingRequests.value = requestsData
  })

  // Sent requests
  const sentRequestsQuery = query(
    requestsRef,
    where('senderId', '==', auth.currentUser.uid),
    where('status', '==', 'pending')
  )

  sentRequestsUnsubscribe.value = onSnapshot(sentRequestsQuery, async (snapshot) => {
    const sentRequestsData = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data()
        const userData = await getUserData(data.recipientId)
        return {
          id: doc.id,
          ...userData,
          requestId: doc.id,
          status: 'sent'
        }
      })
    )
    sentRequests.value = sentRequestsData
  })

  // Update status listener to use Firestore
  const statusRef = collection(db, 'status')
  statusUnsubscribe.value = onSnapshot(statusRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const userId = change.doc.id
      if (change.type === 'added' || change.type === 'modified') {
        onlineStatus.value[userId] = change.doc.data()
      } else if (change.type === 'removed') {
        onlineStatus.value[userId] = { state: 'offline' }
      }
    })
  })
}

// Update the setupLastMessageListener function
const setupLastMessageListener = (chatId, friendId) => {
  // Listen for chat document updates
  const chatRef = doc(db, 'chats', chatId)
  
  return onSnapshot(chatRef, async (doc) => {
    if (doc.exists()) {
      const chatData = doc.data()
      const friendIndex = friends.value.findIndex(f => f.id === friendId)
      
      if (friendIndex !== -1 && chatData.lastMessage) {
        // Update the friend's last message
        friends.value[friendIndex].lastMessage = chatData.lastMessage
        
        // Update unread count if needed
        if (chatData.lastMessage.senderId === friendId && 
            !chatData.lastMessage.read && 
            currentChat.value?.id !== chatId) {
          friends.value[friendIndex].unreadCount = (friends.value[friendIndex].unreadCount || 0) + 1
        }
      }
    }
  })
}


// Update the markMessagesAsRead function
const markMessagesAsRead = async (chatId) => {
  if (!chatId || !currentUser.value) return

  try {
    // Get all unread messages from the other user
    const unreadMessagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      where('senderId', '!=', currentUser.value.uid),
      where('read', '==', false),
      orderBy('senderId'),
      orderBy('read')
    )

    const unreadMessages = await getDocs(unreadMessagesQuery)
    
    if (!unreadMessages.empty) {
      const batch = writeBatch(db)

      // Mark all unread messages as read
      unreadMessages.docs.forEach(doc => {
        batch.update(doc.ref, { 
          read: true,
          readAt: serverTimestamp()
        })
      })

      await batch.commit()

      // Update unread count in friends list
      const friendId = currentChat.value?.otherUser?.id
      if (friendId) {
        const friendIndex = friends.value.findIndex(f => f.id === friendId)
        if (friendIndex !== -1) {
          friends.value[friendIndex].unreadCount = 0
        }
      }
    }
  } catch (error) {
    console.error('Error marking messages as read:', error)
  }
}

// Update the setupMessageUpdatesListener function
const setupMessageUpdatesListener = (chatId, friendId) => {
  const messagesQuery = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'desc'),
    limit(1)
  )

  return onSnapshot(messagesQuery, async (snapshot) => {
    if (!snapshot.empty) {
      const lastMessage = snapshot.docs[0].data()
      const friendIndex = friends.value.findIndex(f => f.id === friendId)
      
      if (friendIndex !== -1) {
        // Update the friend's last message
        friends.value[friendIndex].lastMessage = lastMessage

        // Update unread count if message is from friend and not read
        if (lastMessage.senderId === friendId && 
            !lastMessage.read && 
            currentChat.value?.chatId !== chatId) {
          friends.value[friendIndex].unreadCount = (friends.value[friendIndex].unreadCount || 0) + 1
        }
      }
    }
  })
}

// Update the setupMessageListeners function
const setupMessageListeners = () => {
  friends.value.forEach(async (friend) => {
    const chatId = [auth.currentUser.uid, friend.id].sort().join('_')
    
    // Set up last message listener
    const lastMessageUnsubscribe = setupLastMessageListener(chatId, friend.id)
    
    // Set up message updates listener
    const messageUpdatesUnsubscribe = setupMessageUpdatesListener(chatId, friend.id)
    
    // Listen for unread messages count
    const unreadQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      where('senderId', '==', friend.id),
      where('read', '==', false)
    )

    const unreadUnsubscribe = onSnapshot(unreadQuery, (snapshot) => {
      const friendIndex = friends.value.findIndex(f => f.id === friend.id)
      if (friendIndex !== -1) {
        // Only update unread count if we're not in this chat
        if (currentChat.value?.chatId !== chatId) {
          friends.value[friendIndex].unreadCount = snapshot.size
        } else {
          friends.value[friendIndex].unreadCount = 0
        }
      }
    })

    // Store unsubscribe functions for cleanup
    friend.messageListeners = {
      lastMessage: lastMessageUnsubscribe,
      messageUpdates: messageUpdatesUnsubscribe,
      unread: unreadUnsubscribe
    }
  })
}

const startChat = async (friend) => {
  try {
    currentChat.value = {
      otherUser: friend,
      chatId: [currentUser.value.uid, friend.id].sort().join('_')
    }

    // Hide sidebar on mobile when starting a chat
    if (window.innerWidth < 768) { // 768px is the md breakpoint in Tailwind
      showSidebar.value = false
    }

    if (friend.id) {
      // Log activity for sender
      await activityStore.addActivity({
        type: 'sent',
        userId: currentUser.value.uid,
        senderId: friend.id,
        message: 'You started a chat'
      })

      // Log activity for recipient
      await activityStore.addActivity({
        type: 'received',
        userId: friend.id,
        senderId: currentUser.value.uid,
        message: 'started a chat with you'
      })
    }
    
    // Mark messages as read when starting chat
    const messagesQuery = query(
      collection(db, 'chats', currentChat.value.chatId, 'messages'),
      where('senderId', '==', friend.id),
      where('read', '==', false)
    )
    
    const messagesSnapshot = await getDocs(messagesQuery)
    const batch = writeBatch(db)
    
    messagesSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { 
        read: true,
        readAt: serverTimestamp()
      })
    })
    
    await batch.commit()
    
    // Update friend's unread count
    const friendIndex = friends.value.findIndex(f => f.id === friend.id)
    if (friendIndex !== -1) {
      friends.value[friendIndex].unreadCount = 0
    }
    
    // Load messages
    await loadMessages()
  } catch (error) {
    console.error('Error starting chat:', error)
  }
}

const acceptFriendRequest = async (user) => {
  try {
    const request = pendingRequests.value.find(req => 
      req.senderId === user.id && req.recipientId === auth.currentUser.uid
    )
    
    if (request) {
      await addDoc(collection(db, 'friends'), {
        participants: [auth.currentUser.uid, user.senderId],
        createdAt: serverTimestamp()
      })
      await deleteDoc(doc(db, 'friendRequests', user.id))
      showToast('success', 'Success', 'Friend request accepted')
    }
  } catch (error) {
    console.error('Error accepting friend request:', error)
    showToast('error', 'Error', error.message)
  }
}

const rejectFriendRequest = async (request) => {
  try {
    await deleteDoc(doc(db, 'friendRequests', request.requestId))
    showToast('success', 'Success', 'Friend request rejected')
  } catch (error) {
    console.error('Error rejecting friend request:', error)
    showToast('error', 'Error', error.message)
  }
}

const removeFriend = async (friend) => {
  try {
    // If friend parameter is provided, it's from the friend list
    // Otherwise, it's from the chat menu
    const friendToRemove = friend || currentChat.value?.otherUser
    if (!friendToRemove || !friendToRemove.id || !currentUser.value?.uid) {
      console.error('Invalid friend or user data')
      return
    }

    // Get the chat ID
    const chatId = [currentUser.value.uid, friendToRemove.id].sort().join('_')
    if (!chatId) {
      console.error('Could not generate chat ID')
      return
    }

    const chatRef = doc(db, 'chats', chatId)
    const messagesRef = collection(db, 'chats', chatId, 'messages')
    
    // Get all messages
    const messagesSnapshot = await getDocs(messagesRef)
    
    // Delete all messages and chat document
    const batch = writeBatch(db)
    messagesSnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })
    batch.delete(chatRef)
    
    // Delete the friendship document
    const friendshipQuery = query(
      collection(db, 'friends'),
      where('participants', 'array-contains', currentUser.value.uid)
    )
    const friendshipSnapshot = await getDocs(friendshipQuery)
    friendshipSnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.participants && data.participants.includes(friendToRemove.id)) {
        batch.delete(doc.ref)
      }
    })
    
    await batch.commit()
    
    // Update friends list
    const updatedFriends = friends.value.filter(f => f.id !== friendToRemove.id)
    friends.value = updatedFriends
    
    // Clear current chat if we're removing the current chat
    if (currentChat.value?.otherUser?.id === friendToRemove.id) {
      currentChat.value = null
      messages.value = []
    }
    
    showChatMenu.value = false
    showToast('success', 'Success', 'Friend removed')
  } catch (error) {
    console.error('Error removing friend:', error)
    showToast('error', 'Error', error.message)
  }
}

// Fetch messages for a chat
const fetchMessages = async (chatId) => {
  try {
    loading.value = true
    messages.value = []

    // Unsubscribe from previous chat if exists
    if (messagesUnsubscribe) {
      messagesUnsubscribe()
      messagesUnsubscribe = null
    }
    if (typingUnsubscribe) {
      typingUnsubscribe()
      typingUnsubscribe = null
    }

    // Mark messages as read when fetching
    await markMessagesAsRead(chatId)

    // Subscribe to messages
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    )

    messagesUnsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse() // Reverse to show oldest first
      
      // Check for new messages
      if (messages.value.length > 0 && newMessages.length > messages.value.length) {
        const latestMessage = newMessages[newMessages.length - 1]
        if (latestMessage.senderId !== currentUser.value.uid) {
          // Mark new messages as read if we're in the chat
          markMessagesAsRead(chatId)
        }
      }
      
      messages.value = newMessages
      scrollToBottom()
    })

    // Subscribe to typing status
    const typingRef = collection(db, 'chats', chatId, 'typing')
    typingUnsubscribe = onSnapshot(typingRef, (snapshot) => {
      const typingStatus = {}
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.userId !== currentUser.value.uid) {
          typingStatus[data.userId] = data.isTyping
        }
      })
      // Update typing status in currentChat
      if (currentChat.value) {
        currentChat.value.otherUser.isTyping = Object.values(typingStatus).some(status => status)
      }
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    showToast('error', t('common.error'), error.message)
  } finally {
    loading.value = false
  }
}

// Send message
const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentChat.value) return

  try {
    const chatId = currentChat.value.chatId
    if (!chatId) {
      console.error('No chat ID found')
      return
    }

    const messageData = {
      content: newMessage.value.trim(),
      senderId: currentUser.value.uid,
      senderName: currentUser.value.displayName,
      timestamp: serverTimestamp(),
      read: false
    }

    // Create chat document if it doesn't exist
    const chatRef = doc(db, 'chats', chatId)
    const chatDoc = await getDoc(chatRef)
    
    if (!chatDoc.exists()) {
      await setDoc(chatRef, {
        participants: [currentUser.value.uid, currentChat.value.otherUser.id],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }

    const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), messageData)
    newMessage.value = ''
    scrollToBottom()
    
    // Play sent message sound
    playSendSound()

    // Update last message in chat document
    await updateDoc(chatRef, {
      lastMessage: messageData,
      updatedAt: serverTimestamp()
    })

    // Update the friend's last message in the friends list
    const friendIndex = friends.value.findIndex(f => f.id === currentChat.value.otherUser.id)
    if (friendIndex !== -1) {
      friends.value[friendIndex].lastMessage = messageData
    }



  } catch (error) {
    console.error('Error sending message:', error)
    showToast('error', t('common.error'), error.message)
  }
}

// Handle typing status
const handleTyping = async () => {
  if (!currentChat.value) return

  try {
    const chatId = currentChat.value.chatId
    if (!chatId) {
      console.error('No chat ID found')
      return
    }

    // Clear existing timeout
    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value)
    }

    // If not already typing, set typing status
    if (!isTyping.value) {
      isTyping.value = true
      const typingRef = doc(db, 'chats', chatId, 'typing', currentUser.value.uid)
      await setDoc(typingRef, {
        userId: currentUser.value.uid,
        isTyping: true,
        timestamp: serverTimestamp()
      }, { merge: true })
    }

    // Set new timeout to clear typing status
    typingTimeout.value = setTimeout(async () => {
      isTyping.value = false
      const typingRef = doc(db, 'chats', chatId, 'typing', currentUser.value.uid)
      await setDoc(typingRef, {
        isTyping: false,
        timestamp: serverTimestamp()
      }, { merge: true })
    }, typingDebounceTime)

  } catch (error) {
    console.error('Error updating typing status:', error)
  }
}

// Initialize component
onMounted(async () => {
  await fetchCurrentUser()
  setupRealtimeListeners()
  setupMessageListeners()
  
  // Setup presence
  onAuthStateChanged(getAuth(), (user) => {
    if (user) {
      setupPresence(user)
    }
  })
  
  // Initialize audio elements
  try {
    sendSound.value = new Audio(sendMessageSound)
    await sendSound.value.load()
  } catch (error) {
    console.error('Error initializing sounds:', error)
  }

  // Initialize chat if chatId is present in route
  await initializeChat()

  // Watch for route changes
  watch(
    () => route.query.chatId,
    async (newChatId, oldChatId) => {
      if (oldChatId && !newChatId) {
        cleanupChat()
      } else if (newChatId && newChatId !== oldChatId) {
        await initializeChat()
      }
    }
  )

  // Check if user is blocked
  if (currentChat.value?.otherUser?.id) {
    const blockedUserRef = doc(db, 'users', currentUser.value.uid, 'blockedUsers', currentChat.value.otherUser.id)
    const blockedDoc = await getDoc(blockedUserRef)
    isBlocked.value = blockedDoc.exists()
  }
})

onUnmounted(() => {
  // Clean up all listeners
  if (friendsUnsubscribe.value) {
    friendsUnsubscribe.value()
  }
  if (requestsUnsubscribe.value) {
    requestsUnsubscribe.value()
  }
  if (sentRequestsUnsubscribe.value) {
    sentRequestsUnsubscribe.value()
  }
  if (messagesUnsubscribe.value) {
    messagesUnsubscribe.value()
  }
  if (typingUnsubscribe.value) {
    typingUnsubscribe.value()
  }
  if (statusUnsubscribe.value) {
    statusUnsubscribe.value()
  }
  
  // Clean up message listeners for each friend
  friends.value.forEach(friend => {
    if (friend.messageListeners) {
      if (friend.messageListeners.lastMessage) friend.messageListeners.lastMessage()
      if (friend.messageListeners.messageUpdates) friend.messageListeners.messageUpdates()
      if (friend.messageListeners.unread) friend.messageListeners.unread()
    }
  })
  
  // Clean up presence
  if (userStatusRef.value) {
    userStatusRef.value = null
  }
  if (userStatusDatabaseRef.value) {
    userStatusDatabaseRef.value = null
  }
  
  // Clear typing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
  
  // Clean up audio elements
  if (sendSound.value) {
    sendSound.value.pause()
    sendSound.value = null
  }

  // Clean up current chat
  cleanupChat()
})

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const lastMessageTime = (timestamp) => {
  if (!timestamp) return ''
  
  // Convert timestamp to Date object
  let msgDate
  if (timestamp.toDate) {
    // Handle Firestore timestamp
    msgDate = timestamp.toDate()
  } else if (timestamp instanceof Date) {
    // Handle Date object
    msgDate = timestamp
  } else if (typeof timestamp === 'number') {
    // Handle Unix timestamp
    msgDate = new Date(timestamp)
  } else if (typeof timestamp === 'string') {
    // Handle ISO string
    msgDate = new Date(timestamp)
  } else {
    return ''
  }
  
  const now = new Date()
  
  if (now.toDateString() === msgDate.toDateString()) {
    return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (now.getTime() - msgDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
    return msgDate.toLocaleDateString([], { weekday: 'short' })
  } else {
    return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
}

// Update isOnline function to be more accurate
const isOnline = (userId) => {
  if (!userId) return false
  const status = onlineStatus.value[userId]
  if (!status) return false
  
  // Check if the last status update was within the last 30 seconds
  const lastChanged = status.lastChanged?.toDate()
  if (!lastChanged) return false
  
  const now = new Date()
  const timeDiff = now.getTime() - lastChanged.getTime()
  return status.state === 'online' && timeDiff < 30000 // 30 seconds threshold
}

// Update formatLastSeen to be more accurate
const formatLastSeen = (userId) => {
  if (!userId) return t('chat.offline')
  const status = onlineStatus.value[userId]
  if (!status?.lastChanged) return t('chat.offline')
  
  const lastChanged = status.lastChanged.toDate()
  const now = new Date()
  const timeDiff = now.getTime() - lastChanged.getTime()
  
  // If last seen was less than 30 seconds ago and status is online, show online
  if (timeDiff < 30000 && status.state === 'online') {
    return t('chat.online')
  }
  
  return formatDistanceToNow(lastChanged, { addSuffix: true })
}

// Update the getLastMessagePreview function
const getLastMessagePreview = (friend) => {
  if (!friend.lastMessage) return 'No messages yet'
  
  const message = friend.lastMessage
  
  // Handle different message types
  switch (message.type) {
    case 'sticker':
      return message.senderId === currentUser.value.uid ? 'You sent a sticker' : 'Sent a sticker'
    case 'image':
      return message.senderId === currentUser.value.uid ? 'You sent an image' : 'Sent an image'
    case 'file':
      return message.senderId === currentUser.value.uid 
        ? `You sent a file: ${message.fileName || 'File'}`
        : `Sent a file: ${message.fileName || 'File'}`
    case 'audio':
      return message.senderId === currentUser.value.uid ? 'You sent a voice message' : 'Sent a voice message'
    case 'video':
      return message.senderId === currentUser.value.uid ? 'You sent a video' : 'Sent a video'
    default:
      // For text messages
      const content = message.content
      if (!content) return 'No messages yet'
      
      // Handle forwarded messages
      if (message.forwarded) {
        const prefix = message.senderId === currentUser.value.uid ? 'You forwarded: ' : 'Forwarded: '
        return `${prefix}${content.length > 25 ? content.substring(0, 25) + '...' : content}`
      }
      
      // Truncate long messages
      return content.length > 30 ? content.substring(0, 30) + '...' : content
  }
}

// Add message actions
const handleMessageAction = async (message, action) => {
  switch (action) {
    case 'edit':
      editingMessage.value = message
      break
    case 'delete':
      if (confirm(t('chat.confirmDelete'))) {
        await deleteMessage(message)
      }
      break
    case 'forward':
      selectedMessages.value = [message]
      showForwardModal.value = true
      break
    case 'react':
      showReactionPicker.value = message.id
      break
  }
  showMessageMenu.value = null
}

// Edit message
const editMessage = async (message, newContent) => {
  try {
    if (!currentChat.value) {
      console.error('No current chat found')
      return
    }

    const chatId = currentChat.value.chatId
    if (!chatId) {
      console.error('No chat ID found')
      return
    }

    // Only allow editing own messages
    if (message.senderId !== currentUser.value.uid) {
      showToast('error', t('common.error'), 'You can only edit your own messages')
      return
    }

    // Don't allow empty messages
    if (!newContent.trim()) {
      showToast('error', t('common.error'), 'Message cannot be empty')
      return
    }

    const messageRef = doc(db, 'chats', chatId, 'messages', message.id)
    await updateDoc(messageRef, {
      content: newContent.trim(),
      edited: true,
      editedAt: serverTimestamp()
    })

    // Update the message in the local messages array
    const messageIndex = messages.value.findIndex(m => m.id === message.id)
    if (messageIndex !== -1) {
      messages.value[messageIndex] = {
        ...messages.value[messageIndex],
        content: newContent.trim(),
        edited: true,
        editedAt: serverTimestamp()
      }
    }

    // Update last message if this was the last message
    if (messages.value[messages.value.length - 1].id === message.id) {
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: {
          ...message,
          content: newContent.trim(),
          edited: true,
          editedAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      })
    }

    showToast('success', t('common.success'), 'Message edited')
    // Reset editing state
    editingMessage.value = null
    editedMessageContent.value = ''
    // Close the menu after successful edit
    showMessageMenu.value = null
  } catch (error) {
    console.error('Error editing message:', error)
    showToast('error', t('common.error'), error.message)
  }
}

// Delete message
const deleteMessage = async (message) => {
  try {
    if (!currentChat.value) {
      console.error('No current chat found')
      return
    }

    const chatId = currentChat.value.chatId
    if (!chatId) {
      console.error('No chat ID found')
      return
    }

    // Delete the message
    const messageRef = doc(db, 'chats', chatId, 'messages', message.id)
    await deleteDoc(messageRef)

    // Update last message if needed
    if (messages.value.length > 1) {
      const lastMessage = messages.value[messages.value.length - 2]
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: lastMessage,
        updatedAt: serverTimestamp()
      })
    } else {
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: null,
        updatedAt: serverTimestamp()
      })
    }

    showToast('success', t('common.success'), 'Message deleted')
    showMessageMenu.value = null
  } catch (error) {
    console.error('Error deleting message:', error)
    showToast('error', t('common.error'), error.message)
  }
}

// Add reaction to message
const addReaction = async (messageId, reaction) => {
  try {
    if (!currentChat.value) {
      console.error('No current chat found')
      return
    }

    const chatId = currentChat.value.chatId
    if (!chatId) {
      console.error('No chat ID found')
      return
    }

    const messageRef = doc(db, 'chats', chatId, 'messages', messageId)
    const messageDoc = await getDoc(messageRef)
    
    if (messageDoc.exists()) {
      const message = messageDoc.data()
      const reactions = message.reactions || {}
      
      // Remove user's previous reaction if it exists
      Object.keys(reactions).forEach(key => {
        const userIndex = reactions[key].indexOf(currentUser.value.uid)
        if (userIndex !== -1) {
          reactions[key].splice(userIndex, 1)
          if (reactions[key].length === 0) {
            delete reactions[key]
          }
        }
      })
      
      // Add new reaction
      const userReactions = reactions[reaction] || []
      userReactions.push(currentUser.value.uid)
      reactions[reaction] = userReactions
      
      // Cache current user data
      if (!userCache.value[currentUser.value.uid]) {
        userCache.value[currentUser.value.uid] = {
          displayName: currentUser.value.displayName,
          photoURL: currentUser.value.photoURL
        }
      }
      
      await updateDoc(messageRef, { reactions })
    }
    showReactionPicker.value = null
  } catch (error) {
    console.error('Error adding reaction:', error)
    showToast('error', t('common.error'), error.message)
  }
}

// Add message selection functions
const selectMessage = (message) => {
  const index = selectedMessages.value.findIndex(m => m.id === message.id)
  if (index === -1) {
    selectedMessages.value.push(message)
  } else {
    selectedMessages.value.splice(index, 1)
  }
}

const clearSelectedMessages = () => {
  selectedMessages.value = []
}

// Add showMessageMenuForMessage function
const showMessageMenuForMessage = (message, event) => {
  // Prevent showing menu if clicking on reactions or other interactive elements
  if (event.target.closest('.reaction-group') || 
      event.target.closest('.reaction-button') ||
      event.target.closest('.message-actions')) {
    return
  }

  // Only show menu for user's own messages
  if (message.senderId !== currentUser.value.uid) {
    return
  }

  // Get message element position
  const messageElement = event.currentTarget
  const rect = messageElement.getBoundingClientRect()
  
  // Set menu position at click position
  messageMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  
  // Show menu
  showMessageMenu.value = message
}

// Add messageMenuPosition ref
const messageMenuPosition = ref({ x: 0, y: 0 })

// Update the setupPresence function
const setupPresence = (user) => {
  if (!user) return

  try {
    // Set up presence using Firestore
    const statusRef = doc(db, 'status', user.uid)
    userStatusRef.value = statusRef

    // Set initial online status
    setDoc(statusRef, {
      state: 'online',
      lastChanged: serverTimestamp()
    })

    // Set up periodic updates
    const statusUpdateInterval = setInterval(() => {
      if (user) {
        setDoc(statusRef, {
          state: 'online',
          lastChanged: serverTimestamp()
        }, { merge: true }).catch(error => {
          console.error('Error updating periodic status:', error)
        })
      }
    }, 15000) // Update every 15 seconds

    // Set up offline status when user disconnects
    window.addEventListener('beforeunload', () => {
      setDoc(statusRef, {
        state: 'offline',
        lastChanged: serverTimestamp()
      })
    })

    // Clean up on unmount
    onUnmounted(() => {
      clearInterval(statusUpdateInterval)
      setDoc(statusRef, {
        state: 'offline',
        lastChanged: serverTimestamp()
      })
    })

  } catch (error) {
    console.error('Error setting up presence:', error)
  }
}

// Add function to handle chat initialization
const initializeChat = async () => {
  const chatId = route.query.chatId
  if (chatId) {
    try {
      const chatDoc = await getDoc(doc(db, 'chats', chatId))
      if (chatDoc.exists()) {
        const data = chatDoc.data()
        const otherUserId = data.participants.find(id => id !== auth.currentUser.uid)
        const otherUserData = await getUserData(otherUserId)
        
        currentChat.value = {
          id: chatId,
          otherUser: {
            id: otherUserId,
            ...otherUserData
          }
        }
        
        await fetchMessages(chatId)
      }
    } catch (error) {
      console.error('Error initializing chat:', error)
      showToast('error', 'Error', error.message)
    }
  }
}

// Add this function to handle cleanup
const cleanupChat = () => {
  // Clean up current chat
  if (currentChat.value?.id) {
    markMessagesAsRead(currentChat.value.id)
  }
  currentChat.value = null
  messages.value = []
  
  // Unsubscribe from current listeners
  if (messagesUnsubscribe.value) {
    messagesUnsubscribe.value()
    messagesUnsubscribe.value = null
  }
  if (typingUnsubscribe.value) {
    typingUnsubscribe.value()
    typingUnsubscribe.value = null
  }
}

// Add function to update online status
const updateOnlineStatus = async (userId) => {
  if (!userId) return
  try {
    const statusRef = doc(db, 'status', userId)
    const statusDoc = await getDoc(statusRef)
    onlineStatus.value[userId] = statusDoc.data() || { state: 'offline' }
  } catch (error) {
    console.error('Error updating online status:', error)
    onlineStatus.value[userId] = { state: 'offline' }
  }
}

// Add after the fetchMessages function

// Load messages for current chat
const loadMessages = async () => {
  if (!currentChat.value?.chatId) return
  
  try {
    loading.value = true
    messages.value = []

    // Unsubscribe from previous chat if exists
    if (messagesUnsubscribe.value) {
      messagesUnsubscribe.value()
      messagesUnsubscribe.value = null
    }
    if (typingUnsubscribe.value) {
      typingUnsubscribe.value()
      typingUnsubscribe.value = null
    }

    // Mark messages as read when loading
    await markMessagesAsRead(currentChat.value.chatId)

    // Subscribe to messages
    const q = query(
      collection(db, 'chats', currentChat.value.chatId, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    )

    messagesUnsubscribe.value = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse() // Reverse to show oldest first
      
      // Check for new messages
      if (messages.value.length > 0 && newMessages.length > messages.value.length) {
        const latestMessage = newMessages[newMessages.length - 1]
        if (latestMessage.senderId !== currentUser.value.uid) {
          // Mark new messages as read if we're in the chat
          markMessagesAsRead(currentChat.value.chatId)
        }
      }
      
      messages.value = newMessages
      scrollToBottom()
    })

    // Subscribe to typing status
    const typingRef = collection(db, 'chats', currentChat.value.chatId, 'typing')
    typingUnsubscribe.value = onSnapshot(typingRef, (snapshot) => {
      const typingStatus = {}
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.userId !== currentUser.value.uid) {
          typingStatus[data.userId] = data.isTyping
        }
      })
      // Update typing status in currentChat
      if (currentChat.value) {
        currentChat.value.otherUser.isTyping = Object.values(typingStatus).some(status => status)
      }
    })
  } catch (error) {
    console.error('Error loading messages:', error)
    showToast('error', t('common.error'), error.message)
  } finally {
    loading.value = false
  }
}

// Add scrollToBottom function
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Add after the showMessageMenuForMessage function

// Show reaction picker for a message
const showReactionPickerForMessage = (message, event) => {
  // Prevent showing picker if clicking on reactions or other interactive elements
  if (event.target.closest('.reaction-group') || 
      event.target.closest('.message-actions')) {
    return
  }

  // Get click position
  const x = event.clientX
  const y = event.clientY

  // Set picker position
  reactionPickerPosition.value = {
    x: x,
    y: y - 100 // Position above the click
  }

  // Show picker for this message
  showReactionPicker.value = message.id
}

// Add function to remove reaction
const removeReaction = async (messageId, reaction) => {
  try {
    if (!currentChat.value) {
      console.error('No current chat found')
      return
    }

    const chatId = currentChat.value.chatId
    if (!chatId) {
      console.error('No chat ID found')
      return
    }

    const messageRef = doc(db, 'chats', chatId, 'messages', messageId)
    const messageDoc = await getDoc(messageRef)
    
    if (messageDoc.exists()) {
      const message = messageDoc.data()
      const reactions = message.reactions || {}
      
      // Remove user's reaction
      if (reactions[reaction]) {
        const userIndex = reactions[reaction].indexOf(currentUser.value.uid)
        if (userIndex !== -1) {
          reactions[reaction].splice(userIndex, 1)
          if (reactions[reaction].length === 0) {
            delete reactions[reaction]
          }
          await updateDoc(messageRef, { reactions })
        }
      }
    }
  } catch (error) {
    console.error('Error removing reaction:', error)
    showToast('error', t('common.error'), error.message)
  }
}

// Add function to start editing a message
const startEditingMessage = (message) => {
  editingMessage.value = message
  editedMessageContent.value = message.content
}

// Add function to cancel editing
const cancelEditing = () => {
  editingMessage.value = null
  editedMessageContent.value = ''
}

// Add function to save edited message
const saveEditedMessage = () => {
  if (editingMessage.value && editedMessageContent.value.trim()) {
    editMessage(editingMessage.value, editedMessageContent.value)
  }
}

// Add function to toggle sticker picker
const toggleStickerPicker = (event) => {
  if (event) {
    const rect = event.target.getBoundingClientRect()
    stickerPickerPosition.value = {
      x: rect.left,
      y: rect.top - 300 // Position above the button
    }
  }
  showStickerPicker.value = !showStickerPicker.value
}

// Add function to toggle emoji picker
const toggleEmojiPicker = (event) => {
  if (event) {
    const rect = event.target.getBoundingClientRect()
    emojiPickerPosition.value = {
      x: rect.left,
      y: rect.top - 300 // Position above the button
    }
  }
  showEmojiPicker.value = !showEmojiPicker.value
}

// Add function to send sticker
const sendSticker = async (sticker) => {
  if (!currentChat.value) return

  try {
    const chatId = currentChat.value.chatId
    if (!chatId) {
      console.error('No chat ID found')
      return
    }

    const messageData = {
      type: 'sticker',
      content: sticker.url,
      senderId: currentUser.value.uid,
      senderName: currentUser.value.displayName,
      timestamp: serverTimestamp(),
      read: false
    }

    const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), messageData)
    
    // Play sent message sound
    playSendSound()

    // Update last message in chat document
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: messageData,
      updatedAt: serverTimestamp()
    })

    // Update the friend's last message in the friends list
    const friendIndex = friends.value.findIndex(f => f.id === currentChat.value.otherUser.id)
    if (friendIndex !== -1) {
      friends.value[friendIndex].lastMessage = messageData
    }

    // Close sticker picker
    showStickerPicker.value = false
    scrollToBottom()
  } catch (error) {
    console.error('Error sending sticker:', error)
    showToast('error', t('common.error'), error.message)
  }
}

// Add function to insert emoji
const insertEmoji = (emoji) => {
  newMessage.value += emoji
  showEmojiPicker.value = false
}

const showLanguageMenu = ref(false)
const { currentLocale, changeLocale } = useLanguage()

const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'my', name: 'Myanmar' }
]

const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
}

const changeLanguage = (langCode) => {
  changeLocale(langCode)
  showLanguageMenu.value = false
  showChatMenu.value = false
}

// Close language menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.chat-menu')) {
    showLanguageMenu.value = false
    showChatMenu.value = false
  }
}

const showSidebar = ref(true)
const isMobile = ref(false) // Initialize as false by default

// Update the handleResize function
const handleResize = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768
    if (window.innerWidth >= 768) {
      showSidebar.value = true
    }
  }
}

// Update the toggleSidebar function
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
  // Close chat menu when showing sidebar on mobile
  if (isMobile.value && showSidebar.value) {
    showChatMenu.value = false
  }
}

// Update the toggleChatMenu function
const toggleChatMenu = () => {
  showChatMenu.value = !showChatMenu.value
  // Hide sidebar on mobile when opening chat menu
  if (isMobile.value && showChatMenu.value) {
    showSidebar.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  handleResize() // Initial check
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
})

// Add these refs
const isBlocked = ref(false)

// Add these methods
const blockUser = async () => {
  try {
    if (!currentChat.value?.otherUser?.id) return

    const blockedUsersRef = doc(db, 'users', currentUser.value.uid, 'blockedUsers', currentChat.value.otherUser.id)
    
    if (isBlocked.value) {
      await deleteDoc(blockedUsersRef)
      isBlocked.value = false
      showToast('success', t('common.success'), t('chat.userUnblocked'))
    } else {
      await setDoc(blockedUsersRef, {
        blockedAt: serverTimestamp(),
        userId: currentChat.value.otherUser.id
      })
      isBlocked.value = true
      showToast('success', t('common.success'), t('chat.userBlocked'))
    }
  } catch (error) {
    console.error('Error blocking/unblocking user:', error)
    showToast('error', t('common.error'), error.message)
  }
}

const deleteConversation = async () => {
  try {
    if (!currentChat.value?.chatId) return

    // Show confirmation dialog
    const result = await Swal.fire({
      title: t('chat.confirmDeleteConversation'),
      text: t('chat.confirmDeleteConversationMessage'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t('common.yes'),
      cancelButtonText: t('common.cancel')
    })

    if (result.isConfirmed) {
      const chatId = currentChat.value.chatId
      const messagesRef = collection(db, 'chats', chatId, 'messages')
      
      // Get all messages
      const messagesSnapshot = await getDocs(messagesRef)
      
      // Delete all messages and chat document
      const batch = writeBatch(db)
      messagesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      
      // Delete the chat document
      batch.delete(doc(db, 'chats', chatId))
      
      await batch.commit()
      
      // Clear current chat
      currentChat.value = null
      messages.value = []
      
      showToast('success', t('common.success'), t('chat.conversationDeleted'))
      showChatMenu.value = false
    }
  } catch (error) {
    console.error('Error deleting conversation:', error)
    showToast('error', t('common.error'), error.message)
  }
}
</script>



<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background 0.2s;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.dark ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Message animations */
@keyframes slideIn {
  from {
  opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-container {
  animation: slideIn 0.3s ease-out;
  align-items: flex-start;
}

/* Profile picture hover effect */
.message-container img {
  transition: transform 0.2s ease;
}

.message-container:hover img {
  transform: scale(1.05);
}


/* Message bubbles */
.message-bubble {
  position: relative;
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 8px;
  max-width: 80%;
  word-break: break-word;
  font-size: 1rem;
  line-height: 1.6;
  background: none;
  box-shadow: none;
  border: none;
  transition: none;
}

.sent-bubble {
  background: #3b82f6;
  color: #fff;
  border-top-right-radius: 4px;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  margin-left: auto;
}

.sent-bubble::after {
  content: '';
  position: absolute;
  right: -8px;
  bottom: 0;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-left-color: #3b82f6;
  border-right: 0;
  border-top: 0;
}

.received-bubble {
  background: #f3f4f6;
  color: #22223b;
  border-top-left-radius: 4px;
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  margin-right: auto;
}

.received-bubble::after {
  content: '';
  position: absolute;
  left: -8px;
  bottom: 0;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-right-color: #f3f4f6;
  border-left: 0;
  border-top: 0;
}

.dark .received-bubble {
  background: #374151;
  color: #f3f4f6;
}

.dark .received-bubble::after {
  border-right-color: #374151;
}

/* Minimal Typing Status Styles */
.typing-status {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 8px;
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 1px;
}

.dot {
  width: 3px;
  height: 3px;
  background: #3b82f6;
  border-radius: 50%;
  animation: typingAnimation 1.2s infinite ease-in-out;
}

.typing-dots .dot:nth-child(1) { animation-delay: 0s; }
.typing-dots .dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dots .dot:nth-child(3) { animation-delay: 0.4s; }

/* Online Status */
.online-status {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #10b981;
}

.online-status .dot {
  background: #10b981;
  animation: pulse 2s infinite;
}

/* Last Seen */
.last-seen {
  color: #6b7280;
}

/* Dark Mode */
.dark .typing-status {
  background: rgba(59, 130, 246, 0.12);
}

.dark .dot {
  background: #60a5fa;
}

.dark .online-status .dot {
  background: #34d399;
}

.dark .last-seen {
  color: #9ca3af;
}

/* Animations */
@keyframes typingAnimation {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-2px);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

/* Message context menu */
.message-context-menu {
  position: absolute;
  z-index: 100;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 160px;
}

.dark .message-context-menu {
  background: #1f2937;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.message-menu-item {
  padding: 8px 12px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.message-menu-item:hover {
  background: #f3f4f6;
}

.dark .message-menu-item:hover {
  background: #374151;
}


/* Sent message specific styles */
.message-bubble.sent {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-bubble.sent::after {
  content: '';
  position: absolute;
  top: 0;
  right: -8px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  clip-path: polygon(0 0, 100% 0, 0 100%);
}

/* Received message specific styles */
.message-bubble.received {
  background: linear-gradient(135deg, var(--gray-100), var(--gray-200));
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dark .message-bubble.received {
  background: linear-gradient(135deg, var(--gray-700), var(--gray-800));
}

.message-bubble.received::after {
  content: '';
  position: absolute;
  top: 0;
  left: -8px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, var(--gray-100), var(--gray-200));
  clip-path: polygon(100% 0, 100% 100%, 0 0);
}

.dark .message-bubble.received::after {
  background: linear-gradient(135deg, var(--gray-700), var(--gray-800));
}

/* Message reactions */
.message-bubble .reaction {
  transition: all 0.2s ease;
  transform-origin: center;
}

.message-bubble .reaction:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark .message-bubble .reaction:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Message status indicators */
.message-bubble .status-indicator {
  transition: all 0.2s ease;
}

.message-bubble .status-indicator:hover {
  transform: scale(1.1);
}

/* Message animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-container {
  animation: slideIn 0.3s ease-out;
}

/* Message hover effects */
.message-container:hover .message-bubble {
  transform: translateY(-1px);
}

/* Message text improvements */
.message-bubble p {
  line-height: 1.5;
  letter-spacing: 0.01em;
}

/* Message timestamp */
.message-bubble .timestamp {
  font-size: 0.75rem;
  opacity: 0.8;
  font-weight: 500;
}

/* Message reactions container */
.message-bubble .reactions-container {
  position: absolute;
  bottom: -1.5rem;
  right: 0;
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark .message-bubble .reactions-container {
  background: rgba(31, 41, 55, 0.9);
}

.reaction-button {
  position: absolute;
  bottom: -1.5rem;
  right: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-container:hover .reaction-button {
  opacity: 1;
}

.reaction-emoji {
  font-size: 1.25rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.reaction-emoji:hover {
  transform: scale(1.2);
}

/* Add styles for audio elements */
audio {
  display: none;
}

.reaction-group {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.reaction-group:hover {
  transform: scale(1.05);
}

.reaction-group:hover .reaction-users {
  opacity: 1;
  transform: translateY(0);
}

.dark .reaction-group {
  background: rgba(31, 41, 55, 0.9);
}

.reaction-emoji {
  font-size: 1.25rem;
}

.reaction-users {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.2s ease;
}

.reaction-user-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid white;
  transition: transform 0.2s ease;
}

.dark .reaction-user-avatar {
  border-color: #1f2937;
}

.reaction-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reaction-user-avatar:hover {
  transform: scale(1.2);
  z-index: 1;
}

.message-actions {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 4px;
  z-index: 50;
  min-width: 120px;
}

.dark .message-actions {
  background: #1f2937;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  width: 100%;
  text-align: left;
  font-size: 0.875rem;
  color: #374151;
  transition: all 0.2s;
  white-space: nowrap;
}

.dark .action-button {
  color: #e5e7eb;
}

.action-button:hover {
  background: #f3f4f6;
}

.dark .action-button:hover {
  background: #374151;
}

.action-button.text-red-500 {
  color: #ef4444;
}

.dark .action-button.text-red-500 {
  color: #f87171;
}

/* Add click outside handler */
.click-outside-handler {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
}

/* Message editing styles */
.edit-message-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.edit-message-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #1f2937;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.dark .edit-message-input {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.edit-message-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.dark .edit-message-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.1);
}

.edit-message-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.edit-message-button {
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
}

.edit-message-button.save {
  color: #10b981;
}

.edit-message-button.save:hover {
  background: rgba(16, 185, 129, 0.1);
}

.edit-message-button.cancel {
  color: #ef4444;
}

.edit-message-button.cancel:hover {
  background: rgba(239, 68, 68, 0.1);
}

.dark .edit-message-button.save:hover {
  background: rgba(16, 185, 129, 0.2);
}

.dark .edit-message-button.cancel:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Send Button Styles */
.send-button {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.send-button:active:not(:disabled) {
  transform: scale(0.95);
}

.send-button:disabled {
  background: linear-gradient(135deg, #93c5fd, #60a5fa);
  box-shadow: none;
}

.send-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.send-button:hover:not(:disabled) .send-icon {
  transform: translateX(2px);
}

/* Dark mode styles */
.dark .send-button {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
}

.dark .send-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.4);
}

.dark .send-button:disabled {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
}

/* Add animation for sending */
@keyframes sendPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.send-button:active:not(:disabled) .send-icon {
  animation: sendPulse 0.3s ease;
}

/* Sidebar Toggle Button */
.sidebar-toggle-button {
  position: fixed;
  top: 40px;
  right: 20px;
  z-index: 100;
  background-color: white;
  color: black;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar-toggle-button:hover {
  background-color: #f3f4f6;
}

.sidebar-toggle-button:focus {
  outline: none;
}

.sidebar-toggle-button:active {
  transform: scale(0.9);
}

/* Mobile Sidebar Transition */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(-100%);
}

/* Overlay Transition */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>