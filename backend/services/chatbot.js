// AI Chatbot Response Engine for FeedHope

export function generateChatbotResponse(role, message) {
  if (!message || typeof message !== 'string') {
    return "Hello! I'm Hope, your AI assistant. How can I help you today?";
  }

  const lowerMsg = message.toLowerCase().trim();
  const userRole = (role || 'citizen').toLowerCase();

  // 1. Greetings
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'sup', 'good morning', 'good afternoon', 'good evening', 'namaste', 'hola', 'hi hope', 'hello hope', 'hey hope'];
  const isGreeting = greetings.some(g => lowerMsg === g || lowerMsg.startsWith(g + ' ') || lowerMsg.endsWith(' ' + g) || lowerMsg.includes(g));
  
  if (isGreeting && lowerMsg.length < 25) {
    if (userRole === 'volunteer') {
      return "Hi there! 👋 Thanks for being on the front lines. I can help you with mission details, map navigation, updating rescue status, or managing your online availability. What can I assist you with today?";
    } else if (userRole === 'ngo') {
      return "Greetings! 👋 I'm Hope, your NGO management assistant. How can I help you with bed capacity updates, volunteer dispatches, or tracking incoming rescues today?";
    } else if (userRole === 'admin') {
      return "Hello Admin! 👋 Hope AI reporting for duty. I can help you monitor system analytics, rescue stats, user management, or auto-assignment engine status.";
    } else {
      return "Hello! 👋 I'm Hope, your FeedHope AI Assistant. How can I help you report someone in need or track your active rescue requests today?";
    }
  }

  // 2. Gratitude & Goodbyes
  const thanks = ['thanks', 'thank you', 'thx', 'thankyou', 'appreciate it', 'many thanks', 'ty'];
  if (thanks.some(t => lowerMsg.includes(t))) {
    return "You're very welcome! 😊 I'm always here if you need any help saving lives with FeedHope. Stay safe!";
  }

  const goodbyes = ['bye', 'goodbye', 'see ya', 'cya', 'good night', 'have a nice day'];
  if (goodbyes.some(b => lowerMsg.includes(b))) {
    return "Goodbye! 👋 Thank you for being a part of FeedHope. Have a wonderful day!";
  }

  // 3. System Emergency / Critical Safety
  if (lowerMsg.includes('emergency') || lowerMsg.includes('critical') || lowerMsg.includes('dying') || lowerMsg.includes('severe') || lowerMsg.includes('ambulance') || lowerMsg.includes('911') || lowerMsg.includes('108') || lowerMsg.includes('112')) {
    return "⚠️ **EMERGENCY ASSISTANCE NOTICE**\n\n- If someone is in immediate medical danger, please call local emergency medical services (e.g. **108 / 112 / 911**) immediately!\n- To alert FeedHope: Go to **Dashboard ➔ Report & Save a Life** and set the severity to **Critical**. Our auto-assignment engine instantly prioritizes critical cases for urgent volunteer dispatch.";
  }

  // 4. FeedHope Identity & How It Works
  if (lowerMsg.includes('who are you') || lowerMsg.includes('what are you') || lowerMsg.includes('what is feedhope') || lowerMsg.includes('how does it work') || lowerMsg.includes('about feedhope') || lowerMsg.includes('what can you do') || lowerMsg.includes('purpose')) {
    return "**FeedHope** is a real-time community rescue platform connecting citizens, volunteers, and NGO shelters to save vulnerable people on the streets.\n\n**Here's how FeedHope works:**\n1. 📸 **Citizens** report individuals in need with photos & map locations.\n2. 🤖 **Auto-Assignment Engine** matches the nearest shelter & alerts nearby volunteers.\n3. 🚗 **Volunteers** accept missions, navigate to location, and transport them safely.\n4. 🏥 **NGOs** update bed capacities and welcome rescues into care.";
  }

  // 5. Account, Profile & Sign Out
  if (lowerMsg.includes('profile') || lowerMsg.includes('account') || lowerMsg.includes('sign out') || lowerMsg.includes('logout') || lowerMsg.includes('password') || lowerMsg.includes('email') || lowerMsg.includes('settings')) {
    return "You can view and manage your account details via the **Profile** option on the left navigation sidebar. To sign out, click **Sign Out** at the bottom left of your screen.";
  }

  // 6. Contact & Support
  if (lowerMsg.includes('contact') || lowerMsg.includes('support') || lowerMsg.includes('help line') || lowerMsg.includes('phone') || lowerMsg.includes('reach out') || lowerMsg.includes('developer')) {
    return "Need direct support? You can reach out to our team at **gunasrichowdary86@gmail.com** or contact your system administrator.";
  }

  // 7. Role-Specific & Feature Queries

  // Volunteer Queries
  if (lowerMsg.includes('mission') || lowerMsg.includes('assigned') || lowerMsg.includes('task') || lowerMsg.includes('duty')) {
    return "**Volunteer Missions:**\n1. Ensure your status is set to **Online & Ready** (top right of Volunteer Portal).\n2. When an NGO requests your help, a mission alert card will appear on your dashboard.\n3. Click **Accept Mission** to start navigation and locate the person in need.";
  }

  if (lowerMsg.includes('navigate') || lowerMsg.includes('map') || lowerMsg.includes('location') || lowerMsg.includes('direction') || lowerMsg.includes('route') || lowerMsg.includes('gps')) {
    return "**Navigation & Location:**\nOnce you accept a rescue mission, click the **Navigate** button on the mission card. It will open interactive maps with turn-by-turn directions directly to the reported location.";
  }

  if (lowerMsg.includes('located') || lowerMsg.includes('picked up') || lowerMsg.includes('arrived') || lowerMsg.includes('status update') || lowerMsg.includes('update status') || lowerMsg.includes('progress') || lowerMsg.includes('complete mission')) {
    return "**Updating Mission Progress:**\nAs you carry out a mission, update the status using the buttons on your dashboard:\n- 📍 **Located**: When you reach the person in need.\n- 🚗 **Picked Up**: When they are safely in your vehicle.\n- 🏥 **Arrived / Completed**: When handed over to the NGO shelter.";
  }

  if (lowerMsg.includes('online') || lowerMsg.includes('offline') || lowerMsg.includes('availability') || lowerMsg.includes('ready') || lowerMsg.includes('toggle')) {
    return "**Availability Status:**\nUse the **Status Toggle** at the top right of your Volunteer Portal:\n- **Online & Ready**: You will receive urgent rescue dispatches nearby.\n- **Offline**: Temporarily pauses mission dispatches.";
  }

  // Citizen Queries
  if (lowerMsg.includes('report') || lowerMsg.includes('found someone') || lowerMsg.includes('submit') || lowerMsg.includes('person in need') || lowerMsg.includes('save a life') || lowerMsg.includes('help someone')) {
    return "**How to Report Someone in Need:**\n1. Go to your **Citizen Dashboard**.\n2. Click **Report & Save a Life**.\n3. Upload a photo, set accurate location on the map, select severity (Low / Medium / High / Critical), and add details.\n4. Click **Submit** — our engine will immediately assign a shelter and volunteer.";
  }

  if (lowerMsg.includes('track') || lowerMsg.includes('my report') || lowerMsg.includes('my requests') || lowerMsg.includes('active report')) {
    return "**Tracking Your Reports:**\nYou can track all your submitted reports right from your **Citizen Dashboard**! Each rescue card shows live updates: *Reported ➔ Volunteer En Route ➔ Located ➔ Transporting ➔ Completed*.";
  }

  // NGO Queries
  if (lowerMsg.includes('bed') || lowerMsg.includes('capacity') || lowerMsg.includes('shelter') || lowerMsg.includes('room') || lowerMsg.includes('available beds')) {
    return "**Managing Bed Capacity:**\nNGO administrators can update available bed count at the top of the **NGO Dashboard**. Keeping this count accurate ensures the auto-assignment engine routes rescues only when beds are available.";
  }

  if (lowerMsg.includes('incoming') || lowerMsg.includes('dispatch') || lowerMsg.includes('volunteer list') || lowerMsg.includes('assign volunteer')) {
    return "**Dispatching & Incoming Rescues:**\n1. Incoming rescues appear under **Active Rescues** on your NGO Dashboard.\n2. Select an available online volunteer from the dropdown and click **Assign Volunteer**.\n3. Monitor the volunteer's progress until arrival.";
  }

  // Admin Queries
  if (lowerMsg.includes('analytics') || lowerMsg.includes('stats') || lowerMsg.includes('chart') || lowerMsg.includes('distribution') || lowerMsg.includes('rate')) {
    return "**Analytics & System Stats:**\nThe **Admin Dashboard** displays real-time analytics including active vs completed rescues, severity distribution (Critical / High / Medium / Low), and overall response times.";
  }

  if (lowerMsg.includes('user') || lowerMsg.includes('roles') || lowerMsg.includes('ngo list')) {
    return "**User & System Management:**\nAdmins can review registered citizens, active volunteers, and affiliated NGOs across the FeedHope network from the Admin portal.";
  }

  // 8. Smart Fallback by Role if no specific keyword matched
  if (userRole === 'volunteer') {
    return "I'm Hope, your Volunteer Assistant! Here are a few key things you can ask me:\n- 🚀 **'How do I get assigned a mission?'**\n- 🗺️ **'How does navigation work?'**\n- 📍 **'How to update rescue status?'**\n- 🟢 **'How to change my online availability?'**";
  } else if (userRole === 'ngo') {
    return "I'm Hope, your NGO Assistant! Here are key things I can help you with:\n- 🛏️ **'How to update bed capacity?'**\n- 🤝 **'How to assign volunteers to rescues?'**\n- 📋 **'How to track incoming rescues?'**";
  } else if (userRole === 'admin') {
    return "I'm Hope, your Admin Assistant! You can ask me about:\n- 📊 **'System analytics and stats'**\n- 👥 **'User & NGO management'**\n- ⚡ **'Auto-assignment engine status'**";
  } else {
    return "I'm Hope, your AI assistant for FeedHope! Here are common things you can ask me:\n- 📢 **'How do I report someone in need?'**\n- 📍 **'How can I track my submitted reports?'**\n- ⚠️ **'What should I do in an emergency?'**\n- ℹ️ **'What is FeedHope and how does it work?'**";
  }
}

