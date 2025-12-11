export const notificationMessages = [
    {
        title: "20 Daily Re-Engagement Notifications (No Levels, Just Play!)",
        body: "Your brain workout is ready! Take today’s memory challenge — pick any difficulty and play now."
    },
    {
        title: "Quick! 30 seconds is all you need.",
        body: "Open Memory Tiles and refresh your mind."
    },
    {
        title: "{username}, your tiles miss you!",
        body: "Come back and flip a few to stay sharp."
    },
    {
        title: "Daily challenge unlocked!",
        body: "Sharpen your memory today — try Easy, Medium, or Hard."
    },
    {
        title: "Boost your focus today.",
        body: "One short game can make a difference. Tap to play."
    },
    {
        title: "Ready for a quick mental refresh?",
        body: "Your memory board is waiting."
    },
    {
        title: "You’re just one tap away from a sharper mind.",
        body: "Play a quick round now!"
    },
    {
        title: "{username}, can you beat your best time today?",
        body: "It’s game time!"
    },
    {
        title: "Your daily brain boost is here!",
        body: "Flip tiles, match pairs, feel smarter."
    },
    {
        title: "Memory Tiles Reminder",
        body: "A quick match session can brighten your day — try now!"
    },
    {
        title: "Streak alert!",
        body: "Keep your daily play streak alive. Open and play!"
    },
    {
        title: "Take a short break.",
        body: "Play a round and relax your mind."
    },
    {
        title: "Hard Mode calling…",
        body: "Think you can handle it today?"
    },
    {
        title: "Your mind deserves a workout!",
        body: "Try beating yesterday’s performance."
    },
    {
        title: "{username}, warm up your brain!",
        body: "A new board is ready for you."
    },
    {
        title: "Daily mental flex time!",
        body: "Open the app and test your focus."
    },
    {
        title: "Quick fun break?",
        body: "Tap here and start matching tiles instantly."
    },
    {
        title: "Can you memorize faster today?",
        body: "Try a round and find out."
    },
    {
        title: "Memory boost incoming!",
        body: "Play now and feel the improvement."
    },
    {
        title: "It’s tile time!",
        body: "Return today for a fast and fun memory match."
    }
];

export const getRandomMessage = (username = "Player") => {
    const message = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
    return {
        title: message.title.replace("{username}", username),
        body: message.body.replace("{username}", username)
    };
};

export const getSpecificMessages = (count = 3, username = "Player") => {
    const shuffled = [...notificationMessages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(msg => ({
        title: msg.title.replace("{username}", username),
        body: msg.body.replace("{username}", username)
    }));
};
