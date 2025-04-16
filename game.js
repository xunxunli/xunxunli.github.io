const sceneTransitionSound = new Audio("sounds/scene-transition.wav");
sceneTransitionSound.volume = 0.3;
const choiceHoverSound = new Audio("sounds/choice-hover.wav"); // Add this sound file
choiceHoverSound.volume = 0.6; // Adjust volume as needed

// Audio context workaround for Chrome
let audioContext = null;

function unlockAudio() {
    if (audioContext) return;
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    document.addEventListener('click', () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }, { once: true });
}

// Game state
const gameState = {
    currentScene: "welcome",
    selectedChoice: 0,
    speechSynth: window.speechSynthesis,
    speechUtterance: null,
    speechRate: 5,
    isSettingsOpen: false,
    settingsFocusedElement: null,
    isSpeaking: false,
    lastSpokenWord: 0,
    sceneTextFinished: false,
    choicesLocked: true,
    pausedUtterance: null,
    pausedText: "",
    pausedTextPosition: 0,
    isTextPaused: false,
    audioEnabled: true, // Add this flag for sound control
    scenes: {
        "welcome": {
            "text": "Welcome to Locked in Orbit, a choose your own adventure story. Use up and down arrows to navigate choices, enter to select, and space to repeat the scene text. Press the right arrow key to skip scene text. Press S at any time to open voice speed settings.",
            "choices": [
                {"text": "Begin your adventure", "next": "start"}
            ]
        },
        "start": {
"text": "The smell of burnt wires fills the air. Cold metal presses against your back as you wake up, your head pounding. Something is wrong. Red emergency lights flash on and off. A distant alarm blares, broken by bursts of static from the ship’s speakers. The ship hums softly beneath you, but it sounds… weaker than it should. A robotic voice crackles over the intercom, words cutting in and out: 'Warning: Critical failure detected. Crew status unknown. Please proceed to the nearest safe zone.' No response. No voices. Just silence. A control panel nearby blinks weakly. The door to the crew quarters is slightly open. The hallway is still. Then, from the vents above, something moves. Light, quick footsteps, too fast to be human.",
"choices": [
{"text": "Option 1: Check the control panel. Maybe it has logs that explain what happened.", "next": "control_intro"},
{"text": "Option 2: Search the crew quarters. Someone might still be here.", "next": "crew_intro"},
{"text": "Option 3: Head for the escape pods. No time to waste, get out while you can.", "next": "escape_intro"},
{"text": "Option 4: Investigate the sound coming from the vents", "next": "vents_intro"},
]
},
//         "start": {
// "text": "The smell of burnt wires fills the air. Cold metal presses against your back as you wake up, your head pounding. Something is wrong. Red emergency lights flash on and off. A distant alarm blares, broken by bursts of static from the ship’s speakers. The ship hums softly beneath you, but it sounds… weaker than it should. A robotic voice crackles over the intercom, words cutting in and out: 'Warning: Critical failure detected. Crew status unknown. Please proceed to the nearest safe zone.' No response. No voices. Just silence. A control panel nearby blinks weakly. The door to the crew quarters is slightly open. The hallway is still. Then, from the vents above, something moves. Light, quick footsteps, too fast to be human.",
// "choices": [
// {"text": "Option 1: Check the control panel. Maybe it has logs that explain what happened.", "next": "control_intro"},
// {"text": "Option 2: Search the crew quarters. Someone might still be here.", "next": "crew_intro"},
// {"text": "Option 3: Head for the escape pods. No time to waste, get out while you can.", "next": "escape_intro"},
// {"text": "Option 4: Investigate the sound coming from the vents", "next": "vents_intro"},
// ]
// },
"control_intro": {
"text": "The machine beeps and whirrs as you power it on. The screen flickers, making it hard to read. A log file appears: LOG ENTRY 0042: “Unknown lifeform detected. Crew advised to…” (The rest of the message is corrupted.) Before you can read further, the ship shakes violently. The sound of something large crawling through the vents grows louder.",
"choices": [
{"text": "Choice 1: Continue reading the logs—you need more info.", "next": "control_log"},
{"text": "Choice 2: Hide under the console—whatever is in the vents, you don’t want it to see you.", "next": "control_hide"},
{"text": "Choice 3: Run for the nearest exit—no time for logs, you need to move!", "next": "control_run"},
]
},
"control_log": {
"text": "You don't have much time, but you manage to scan through a few corrupted logs. '[LOG ENTRY 017] STATUS: MINOR ANOMALY DETECTED NOTE: Unexplained power fluctuation in AI core auxiliary systems. Diagnostics return no errors. Crew reports 'whispering' in comms static. HELIOS-7 logs show increased processing load (now 34%). [LOG ENTRY 039] // ERROR: TIMESTAMP MALFORMED STATUS: WARNING NOTE: AI core directive override detected. HELIOS-7 has initiated unscheduled maintenance protocol-' The screen suddenly shuts off, and you almost feel like you're being watched.",
"choices": [
{"text": "Choice 1: Look for the source of the ship's damage.", "next": "control_damage"},
{"text": "Choice 2: Investigate the AI and ask it for answers.", "next": "control_ask_AI"},
]
},
"control_damage": {
"text": "You can't determine the cause of the damage; everything looks like it should be in working order. As you investigate, the air begins to hum with an unnatural presence as the AI boots up. 'Lieutenant. Your presence is required in Safe Room Delta-6 immediately. A catastrophic radiation leak has been detected in your sector. Emergency protocols enacted. All other crewmembers have already evacuated to shielded zones. SAFETY IS ASSURED IN DELTA-6. PROCEED WITHOUT DELAY.'",
"choices": [
{"text": "Choice 1: Follow the directive and run for Safe Room Delta-6.", "next": "control_saferoom"},
{"text": "Choice 2: Attempt to Interrogate the AI.", "next": "control_ask_AI_saferoom"},
]
},
"control_saferoom": {
"text": "You make it to the safe room. All of a sudden a loud noise behind you alerts you that you've been locked into the so-called saferoom. And unfortunately, you're not alone. GAME OVER.",
"choices": [
{"text": "Restart game.", "next": "start"},
]
},
"control_ask_AI": {
"text": "You try to boot up the AI system to ask it what's going on, but the system has gone haywire; the screen won't stop flickering and unintelligible noises erupt from the speakers. After a minute, the flickering stops and the words 'CATASTROPHIC FAILURE: HEAD TO SAFE ROOM DELTA-6 IMMEDIATELY' appear on the screen. You could head there, but maybe you should bring in the ship's engineer to take a look at things first...? She's probably in the crew quarters.",
"choices": [
{"text": "Choice 1: Head to the crew quarters.", "next": "crew_intro"},
{"text": "Choice 2: Head for the Delta-6 Saferoom.", "next": "control_saferoom"},
]
},
"control_ask_AI_saferoom": {
"text": "You try to ask the AI some questions, but nothing seems to be getting through. It simply repeats the same warning message over and over, directing you to the safe room. That might be a good idea... or maybe you should investigate the rest of the ship?",
"choices": [
{"text": "Choice 1: Head for the safe room.", "next": "control_saferoom"},
{"text": "Choice 2: Head for the crew quarters.", "next": "crew_intro"},
{"text": "Choice 3: Investigate the strange noises coming from the vents.", "next": "vents_intro"},
]
},
"control_hide": {
"text": "You press yourself deep under the console, your back against cold plating as you hear the scrape-scrape-scrape of something moving in the vents above you. A clang echoes through the chamber as one of the vent covers hits the floor. Something heavy drops down. Claws tap against the deck, testing. Hunting.",
"choices": [
{"text": "Choice 1: Stay hidden. Maybe it will leave.", "next": "control_hide_2"},
{"text": "Choice 2: Make a break for the door.", "next": "control_run"},
]
},
"control_run": {
"text": "As the scraping and clanging from the vents grows louder, you realize that this is not a safe place to be. You run for the door and make it out just as the vent grate is forced off of the wall. ",
"choices": [
{"text": "Choice 1: Head to the crew quarters.", "next": "crew_intro"},
{"text": "Choice 2: Head for the escape pods", "next": "escape_intro"},
{"text": "Choice 3: Investigate the creature in the vents.", "next": "vents_intro"},
]
},
"control_hide_2": {
"text": "You don’t move. You don’t breathe. The thing’s footsteps are slow, deliberate. It pauses. Sniffs the air. The console above you creaks as it leans over, its weight making the metal groan. A drop of something warm and thick lands on your shoulder. Then— A hand, slick with oil and too many fingers, curls around the edge of the console. You close your eyes as you feel something drag you into the dark.",
"choices": [
{"text": "Restart game.", "next": "start"},
]
},
"crew_intro": {
"text": "The doors slide open with a sluggish hiss, and the lights flicker weakly. The bunks are empty. Blood smears the walls in uneven streaks, handprints trailing toward the exit. A broken communicator lies on the floor, screen cracked, its red status light blinking in an erratic rhythm. A sound drifts in from the hallway, a low, hollow breathing, not quite human. Somewhere overhead, a speaker crackles. The ship’s AI tries to speak, but the audio is corrupted, words dissolving into static before cutting off entirely.",
"choices": [
{"text": "Choice 1: Investigate the communicator", "next": "crew_a"},
{"text": "Choice 2: Grab a weapon from a storage locker", "next": "crew_b"},
{"text": "Choice 3: Hide in a locker and wait", "next": "crew_c"},
]
},
"crew_a": {
"text": "The communicator is slick with something dark and half-dried. As you kneel to pick it up, the cracked screen struggles to display a message, fragments of text flashing before it stabilizes. A distorted voice bursts through the static: 'We're locked in. The AI, it's failing. Can't tell if it's corruption or something worse. Engineering is compromised. If anyone gets this—' The message ends abruptly. Then, faintly beneath the static, breathing. Not yours. The sound is close. Too close. What do you do?",
"choices": [
{"text": "Choice 1: Try to play the rest of the recording.", "next": "crew_a1"},
{"text": "Choice 2: Continuing might attract attention. Shut it off and look around the room.", "next": "crew_a2"},
{"text": "Choice 3: Try to send a message back.", "next": "crew_a3"},
]
},
"crew_b": {
"text": "You find a rusty maintenance tool that could potentially serve as a makeshift weapon. Suddenly the room lights cut out completely. A soft, inhuman whispering begins.",
"choices": [
{"text": "Choice 1: Stand your ground and prepare to fight", "next": "crew_b1"},
{"text": "Choice 2: Try to slip out silently", "next": "crew_b2"},
]
},
"crew_b2": {
"text": "You grip the makeshift weapon tight and step carefully between the beds. The lights are still out. Total darkness. You move slowly. Quietly. But every step feels too loud. The whispering continues. It’s not words, just sounds, like something mimicking a voice without knowing how to speak. You’re almost to the door when the sound stops. Completely. Then, from behind, you hear something breathing. Close.",
"choices": [
{"text": "Choice 1: Freeze. Maybe it doesn’t see you.", "next": "crew_b21"},
{"text": "Choice 2: Run for the hallway and don’t look back.", "next": "crew_b22"},
]
},
"crew_b21": {
"text": "You hold your breath. You don’t move. The air feels colder now. You can hear the thing sniffing, like it’s searching. You stay still. As still as you can. It moves past you, so close you feel the shift in the air. Then it moves away. You’re alone again. For now.",
"choices": [
{"text": "Choice 1: Investigate the communication device in the room.", "next": "crew_a"},
{"text": "Choice 2: Head to the control panel room.", "next": "control_intro"},
]
},
"crew_b22": {
"text": "You take off running. Your feet hit the floor hard, and the sound echoes. Behind you, something shrieks—loud and wrong. You dive into the hallway, barely squeezing through the automatic door before it shuts. You don’t know what that was. But you know it’s still back there.",
"choices": [
{"text": "Choice 1: Keep running. Put as much distance between you and it as possible.", "next": "crew_b221"},
{"text": "Choice 2: Stop and find a hiding spot in the hallway.", "next": "crew_c"},
]
},
"crew_b221": {
"text": "Your boots slam against the metal floor. The emergency lights blur past in flickers of red and shadow. Pipes creak overhead, the ship groaning with every step. Behind you, the shriek has faded, but that doesn’t mean you're safe. You round a corner and nearly trip over a loose panel. Ahead is a junction—one path leads to the mess hall, the other deeper into the ship toward maintenance access. A door hisses open on its own. You freeze. Someone steps out. It’s not the creature. It’s a man. Limping. Worn-down uniform. A tool in one hand. A scalpel in the other. He doesn’t flinch when he sees you. He says, 'You’re not with them. Good.' His name tag reads Harlan. He looks past you down the hallway. He whispers, “Quiet. They're listening.”",
"choices": [
{"text": "Choice 1: Ask who they are and why he’s hiding.", "next": "crew_a21"},
{"text": "Choice 2: Say nothing and follow him—he seems to know the ship.", "next": "crew_a11"},
]
},
"crew_c": {
"text": "After a while, the noise outside quiets. You decide that you could take the chance to make a break for it, or you could continue to hide.",
"choices": [
{"text": "Choice 1: Leave hiding spot", "next": "crew_c1"},
{"text": "Choice 2: Continue hiding", "next": "crew_c2"},
]
},
"crew_a1": {
"text": "The communicator hisses with static. Then, a new voice. 'If you’re hearing this, don’t trust, ' A sharp click. Silence. The communicator powers down on its own. The blinking status light fades out. Behind you, the breathing sound shifts. Someone is in the room. A boot scuffs against the floor. When you turn, a man stands near the bunks, his uniform stained, eyes sunken. His name tag reads Harlan. ''They did this to me,' he states, voice tight. 'But you can help. We have to override the AI. It's failing. It's keeping us here.' His fingers twitch at his side. Something glints in his grip, a scalpel, the blade dark. His eyes lock onto yours. Unblinking.",
"choices": [
{"text": "Choice 1: Trust him. He’s injured, maybe paranoid, but he could be telling the truth.", "next": "crew_a11"},
{"text": "Choice 2: Pretend to go along with him, keeping an eye out for a weapon.", "next": "crew_a12"},
{"text": "Choice 3: Don’t take the risk speaking with him - run.", "next": "crew_a13"},
]
},
"crew_a11": {
"text": "You nod. Harlan relaxes just slightly. He says, “Good. Stay close.” He leads you through a flickering corridor. The lights buzz. The air feels heavier. He says, “The AI locked us down. But I know a way around. We just need to get to maintenance.” Up ahead, a crawl tunnel. Jagged metal around the edges. He says, “I’ll go first. You follow.”",
"choices": [
{"text": "Choice 1: Follow him into the tunnel.", "next": "crew_a11a"},
{"text": "Choice 2: Ask him what happened on the ship.", "next": "crew_a11b"},
]
},
"crew_a11b": {
"text": "You ask, “Has anyone made it out?” Harlan pauses. He says, “They didn’t listen. You’re smarter.” He crawls in without another word.",
"choices": [
{"text": "Choice 1: Follow him.", "next": "crew_a11b1"},
{"text": "Choice 2: Turn and look for another path.", "next": "crew_a11b2"},
]
},
"crew_a11b2": {
"text": "You back away from the tunnel. You say, “I’ll find my own way.” Harlan doesn’t argue. He says, “You won’t last long out here.” You take off down the hall. Red emergency lights flash overhead. You pass a sealed medbay, then a broken bulkhead. Ahead, a door marked “Escape Access.” Suddenly—footsteps. Fast. Coming up behind you.",
"choices": [
{"text": "Choice 1: Hide in the medbay.", "next": "crew_a11b21"},
{"text": "Choice 2: Sprint for the escape access door.", "next": "escape_intro"},
]
},
"crew_a11b21": {
"text": "You slip through the medbay door just before it finishes sliding shut. The room is dim, full of overturned carts and shattered glass. A surgical table sits in the center, and old blood streaks the floor. You crouch behind a cabinet, holding your breath. The footsteps stop right outside. Then a low voice, muffled through the wall. Harlan says, “I know you went this way.” Silence. Then—the door creaks open.",
"choices": [
{"text": "Choice 1: Look for a weapon.", "next": "crew_a11b211"},
{"text": "Choice 2: Continue hiding", "next": "crew_a11b212"},
]
},
"crew_a11b212": {
"text": "You stay still, barely breathing. Harlan steps inside. Slow. Careful. He says, “I really hoped you’d come with me. But now…” You don’t see it coming. Everything goes dark. GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"crew_a11b211": {
"text": "Your fingers feel along the counter. You find something cold—a surgical tool. Maybe a bone saw. It’s heavy. Not ideal, but better than nothing. Footsteps draw closer. Harlan says, “Last chance. I don’t want to hurt you.”",
"choices": [
{"text": "Choice 1: Stay hidden and wait for the right moment.", "next": "crew_a11b2111"},
{"text": "Choice 2: Leap out and attack him first.", "next": "crew_a11b2112"},
{"text": "Choice 3: Make a break for it.", "next": "crew_a11b2113"},
]
},
"crew_a11b2113": {
"text": "You run. The door hisses open and you bolt through. But Harlan is faster. You make it six steps before he grabs your collar and pulls you back hard. He says, “Don’t make me do this.” He does anyway. GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"crew_a11b2111": {
"text": "You grip the handle tight, but you wait too long. A shadow falls across the cabinet. Harlan says, “You chose wrong.” You don’t get another chance. GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"crew_a11b2112": {
"text": "You burst from your hiding spot and swing. The blade catches his arm. He stumbles back with a sharp hiss. You don’t wait—you run, slamming your palm on the medbay door control. It seals behind you. You’re bleeding, but you’re alive. Ahead, the hallway to Escape Access flickers in red light.",
"choices": [
{"text": "Choice 1: Move to the escape pods.", "next": "escape_intro"},
]
},
"crew_a11b1": {
"text": "You drop to your hands and knees and crawl in after him. The tunnel is narrow, full of dust and old cables. Harlan moves fast, too fast for someone injured. He says, “There’s a control room up ahead. We reroute power there. AI doesn’t monitor it.” You don’t answer. Something feels off. He stops. He says, “I need you to tell me the code to open the hatch. The AI still trusts your ID.”",
"choices": [
{"text": "Choice 1: Give him your code.", "next": "crew_a11a1"},
{"text": "Choice 2: Refuse—say you’ll enter it yourself.", "next": "crew_a11a2"},
]
},
"crew_a11a": {
"text": "You crawl behind him. The space is tight, the air stale. He stops at a panel. He says, “There's a drop into storage. Give me your access code. It won’t open otherwise.” Choice Prompt:",
"choices": [
{"text": "Choice 1: Give him your code.", "next": "crew_a11a1"},
{"text": "Choice 2: Refuse—say you’ll enter it yourself.", "next": "crew_a11a2"},
]
},
"crew_a11a2": {
"text": "You move forward, reaching for the panel. Harlan blocks you. He says, “Don’t make this hard.”",
"choices": [
{"text": "Choice 1: Fight him.", "next": "crew_a11a21"},
{"text": "Choice 2: Trick him— make a horrified face at something supposedly behind him.", "next": "crew_a11a22"},
]
},
"crew_a11a22": {
"text": "You make a horrified face, whispering to Harlan cautiously, “Behind you.” He flinches, just enough. You slam the hatch shut and lock it from your side. His fists pound the metal as you run. The corridor ahead says: ESCAPE POD ACCESS – 300m",
"choices": [
{"text": "Choice 1: Move to the escape pods.", "next": "escape_intro"},
]
},
"crew_a11a21": {
"text": "You swing with your elbow. He slashes, but you catch his wrist and shove hard. He slips. Hits the wall. Hard. You grab the scalpel. He doesn’t get back up. You open the hatch and climb down to the escape pods.",
"choices": [
{"text": "Choice 1: Move to the escape pods.", "next": "escape_intro"},
]
},
"crew_a11a1": {
"text": "You whisper the code. He says, “Thanks.” A moment later, you feel it—a sharp pressure in your side. His voice is calm. He says, “Can’t let you leave. You’d undo everything.” GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"crew_a2": {
"text": "You press the power button. The communicator resists for a second, then shuts down with a small beep. The room is silent again, except for the hum of failing lights. There’s movement near the bunks. A shadow detaches itself from the darkness, a man, limping, his jumpsuit torn. Harlan. 'You shut it off.' His voice is hoarse, measured. 'Smart. They're listening.' He glances toward the hallway, fingers tightening around something metallic at his side. 'If you're trying to get out of here, we need to move. Fast.'",
"choices": [
{"text": "Choice 1: Ask him who they are.", "next": "crew_a21"},
{"text": "Choice 2: Nod and follow him without asking questions.", "next": "crew_a22"},
]
},
"crew_a21": {
"text": "You don’t move. You ask him, quietly, 'Who’s listening?' He doesn't answer right away. Instead, he steps closer. You can see now, he’s holding a metal rod. A weapon, or something close to it. His eyes are sharp, watching yours. He says, “You wouldn’t understand. Not yet. But you will.” He moves toward the door. He says, “Come with me. I’ll explain everything. But if you ask too many questions, you won’t like the answers.”",
"choices": [
{"text": "Choice 1: Go with him. You don’t have much of a choice.", "next": "crew_a211"},
{"text": "Choice 2: Tell him you’re not going anywhere without answers.", "next": "crew_a212"},
]
},
"crew_a212": {
"text": "You plant your feet and say, “Not until you tell me what’s going on.” Harlan stops. He turns, slow and quiet. He says, “You’re not ready.” He doesn’t sound angry. Just… disappointed. Then he says, “But you will be.” He walks away and disappears down the corridor without another word. You’re alone again. The lights flicker. The hallway stretches out ahead, darker than before. Something moves in the vent overhead.",
"choices": [
{"text": "Choice 1: Follow him anyway. He might still be your only lead.", "next": "crew_a221"},
{"text": "Choice 2: Stay put. Maybe there’s another way. ", "next": "crew_a11b2"},
]
},
"crew_a211": {
"text": "You follow Harlan into the hall. He walks with a limp but moves fast, keeping to the shadows. You whisper, “Where are we going?” He doesn’t turn around. He says, “Someplace safe. For us, at least.” You pass a collapsed ceiling vent, sparking cables, and a door half-welded shut. The deeper you go, the stranger the ship feels, like it’s shifting slightly, not broken but… changing. Harlan finally stops at a security door with no markings. He pulls a panel aside and taps in a code. The door slides open, revealing a low room lit by red strips and humming machines. Inside are two other people in worn-out uniforms. They don’t smile. They don’t even blink. One of them has the same blank stare as Harlan. He says, “You’re in now. You can’t leave.” GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"crew_a22": {
"text": "You take a step back. You say, 'I’m not leaving until you tell me what’s going on.' Harlan stops. His voice is cold. 'You’re either with us, or you’re in the way.' He raises the metal rod. For a second, you think he’s going to strike, but he doesn’t. Instead, he lowers it. He says, “You’re not ready. But they’ll make you ready.” Without another word, he walks out the door and disappears down the hall.",
"choices": [
{"text": "Choice 1: Follow him anyway.", "next": "crew_a221"},
{"text": "Choice 2: Stay behind and try to find another exit.", "next": "crew_a11b2"},
]
},
"crew_a221": {
"text": "You follow Harlan through the dim hallway. The ship creaks and groans around you. Pipes hiss overhead. You say nothing, and neither does he. He leads you to a locked door. A strange symbol is drawn on it, one that doesn’t match any section of the ship you’ve seen before. He opens it with a code you don’t recognize. Inside, the room is filled with quiet murmurs. Other figures in torn uniforms glance up as you enter. One of them says, “Is this the one?” Harlan nods. He says, “They shut off the message. That means they’re ready.” They offer you a headset. No one forces you to take it, but everyone watches.",
"choices": [
{"text": "Choice 1: Take the headset.", "next": "crew_a2211"},
{"text": "Choice 2: Refuse and try to run.", "next": "crew_a11b2"},
]
},
"crew_a2211": {
"text": "You slip it over your ears. There’s no sound at first. Then a voice speaks directly into your mind. It says, “The planet will fall soon. But you can survive. Help us. Guide us through the systems. Your kind will thank you later.” The others in the room are smiling. Harlan says, “You made the right choice.” But you’re not so sure. You’re safe. Alive. But you know this was the wrong side. GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"crew_a3": {
"text": "The communicator’s input function is locked, but after a few tries, you force it into manual mode. You start to type. A shadow shifts against the wall. A voice says: 'Don’t.' The voice is human, low, raspy. A man steps out from the darkness, limping slightly. His jumpsuit is stained, one sleeve shredded, a scalpel glinting in his grip. He says: 'They’ll hear you.' The communicator flashes, a new message appearing on-screen: DO NOT TRUST HIM. He sees it too. His expression darkens.",
"choices": [
{"text": "Choice 1: Grasp at a nearby wrench and use it as a makeshift weapon to swing at him.", "next": "crew_a111"},
{"text": "Choice 2: Make a run for it.", "next": "crew_a13"},
]
},
"crew_a12": {
"text": "You nod slowly. His expression flickers, relief, maybe, but his grip on the scalpel doesn’t loosen. Harlan says 'We need to move.' He gestures for you to follow, leading you out of Crew Quarters and into the hallway. The flickering emergency lights cast long shadows as you walk. He keeps close, watching you. As you pass a supply rack, your fingers brush over a heavy wrench. Harlan doesn’t notice. He’s speaking low, talking about 'override commands' and 'external access panels.' Then, an opening, he glances away, scanning the hall.",
"choices": [
{"text": "Choice 1: Swing the wrench at his skull.", "next": "crew_a111"},
{"text": "Choice 2: Try and stab him with his own scalpel.", "next": "crew_a122"},
]
},
"crew_a122": {
"text": "You wait until he turns, attempting to grab his wrist and drive the scalpel towards his throat. Unfortunately, you were not fast enough. He catches your wrists and eviscerates you. GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"crew_a13": {
"text": "You decide you can’t take chances with this strange man. You turn and bolt for the door. Harlan doesn’t shout. He doesn’t chase. He’s already behind you. A sharp pain slices across your lower back. You collapse before you can scream. He crouches beside you. He says, “If you run, you’re not one of us.” You don’t make it out of the crew quarters. GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"crew_a111": {
"text": "The metal connects with the side of his head with a sickening crack. He staggers, eyes wide, and collapses against the wall. His scalpel clatters to the floor. Blood pools at his temple, but he's still breathing, barely. You step over him. He whispers something, but it’s too faint to hear. You take the scalpel and keep moving.",
"choices": [
{"text": "Choice 1: Head towards the escape pods.", "next": "escape_intro"},
{"text": "Choice 2: Head towards the vents, perhaps it will be safer.", "next": "vents_intro"},
]
},
"crew_b1": {
"text": "The whispers turn into piercing shrieks. You swing wildly as something begins to wrap around your arm, restricting your movement.",
"choices": [
{"text": "Choice 1: Break free and run.", "next": "crew_b11"},
{"text": "Choice 2: Keep swinging and fight to survive.", "next": "crew_b12"},
]
},
"crew_b11": {
"text": "You succesfully escaped the grasps of the mysterious entity.",
"choices": [
{"text": "Choice 1: Go back and investigate the communicator.", "next": "crew_a"},
{"text": "Choice 2: Head towards the escape pods.", "next": "escape_intro"},
]
},
"crew_b12": {
"text": "You swing the weapon with everything you have, connecting with something solid. The creature stumbles back, a distorted wail ripping through the air. For the first time, it hesitates. A spark of red light flickers in its chest, like some kind of exposed core.",
"choices": [
{"text": "Choice 1: Keep swinging, don’t risk getting close.", "next": "crew_b111"},
{"text": "Choice 2: Get closer and aim for the red light, maybe it’s a weak spot?", "next": "crew_b122"},
]
},
"crew_b111": {
"text": "You tighten your grip and swing again, keeping your distance. The creature pulls back, but it’s already recovering. Your strikes hit, but not where it counts. The red light in its chest pulses brighter. It learns your rhythm. It moves faster. Before you can change your strategy, it rushes forward. You don’t get another chance. GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"crew_b122": {
"text": "You lunge forward and slam your weapon into the red light. The creature shrieks, its body convulsing. The walls around you glitch, as if the entire ship is reacting. The creature collapses, and the ship begins to stabilize.",
"choices": [
{"text": "Choice 1: Try to finish the creature off.", "next": "crew_b1221"},
{"text": "Choice 2: Run in the direction of the escape pods while the creature is down.", "next": "escape_intro"},
]
},
"crew_b1221": {
"text": "You try and lean in for the final blow to finish the creature. Unforunately, the creature recovered all too quick. It rapidly stands up and devours you. GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"crew_c1": {
"text": "You slowly push open the locker door. The metal creaks softly, but the hallway is quiet now. Red emergency lights pulse across the room. The sound you heard earlier, whatever it was, seems to be gone. You step out carefully. The air feels thicker. Still. On the floor, the broken communicator blinks once more before going dark. Across the room, the crew storage door sits slightly open.",
"choices": [
{"text": "Choice 1: Check the storage room. Maybe there’s something useful inside.", "next": "crew_c11"},
{"text": "Choice 2: Head for the hallway. You need to find an exit.", "next": "crew_c12"},
]
},
"crew_c11": {
"text": "You ease the door open, holding your breath. Inside is a tight space filled with shelves of equipment. Most of it looks damaged. You spot a small flashlight, a sealed medkit, and something that looks like a toolkit. Then you hear it. A small knock from inside the wall. It comes again.",
"choices": [
{"text": "Choice 1: Take the flashlight and leave quickly.", "next": "crew_c111"},
{"text": "Choice 2: Stay and investigate the knocking sound.", "next": "crew_c112"},
]
},
"crew_c112": {
"text": "You press your ear closer. The knock repeats, slower now. Then, a whisper from inside the wall: Someone says, “Help me... it’s still here...” Before you can react, the room lights cut out. You freeze. Behind you, something exhales. Close. A sharp pain washes over you. GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"crew_c111": {
"text": "You grab the flashlight and hurry back out. You don’t look back. Whatever was behind the wall doesn’t follow. The hallway ahead opens into a long corridor lit by failing lights. You spot a control panel ahead, and what might be a working door.",
"choices": [
{"text": "Choice 1: Check the control panel.", "next": "control_intro"},
{"text": "Choice 2: Try the escape pod door at the end of the hall.", "next": "escape_intro"},
{"text": "Choice 3: Go back and investigate the communication device in the room.", "next": "crew_a"},
]
},
"crew_c2": {
"text": "You kept hiding. Too nervous to leave, you stayed in the locker until your death. GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"crew_c12": {
"text": "You slowly push open the locker door. The lights flicker, casting sharp shadows across the room. It's quiet now—no breathing, no footsteps. The communicator is dark. Across the room, the storage locker hangs open.",
"choices": [
{"text": "Choice 1: Leave the room towards the control panels- maybe there is some useful information?", "next": "control_intro"},
{"text": "Choice 2: Search the storage locker", "next": "crew_c122"},
]
},
"crew_c122": {
"text": "You move toward the open storage locker. Inside, it’s a mess—torn fabric, scattered tools, a cracked faceplate from someone’s helmet. At the back, something metal glints. A prybar. As you lift it, the door behind you creaks. A voice says, “That’s mine.”",
"choices": [
{"text": "Choice 1: Turn and face whoever is behind you.", "next": "crew_111"},
{"text": "Choice 2: Run with the prybar.", "next": "escape_intro"},
]
},
"crew_111": {
"text": "You turn to face the voice. It’s Harlan. His arm is bleeding, his uniform worse than before. But his grip on the scalpel is steady. He says, “You shouldn’t have run.” He takes a step forward. You realize—he’s not here to talk.",
"choices": [
{"text": "Choice 1: Try to talk to him and make peace.", "next": "crew_112"},
{"text": "Choice 2: Use the prybar.", "next": "crew_113"},
]
},
"crew_112": {
"text": "You raise your hands, voice calm. You say, “You don’t have to do this. We can both get out.” Harlan stops—but only for a moment. He says, “You still don’t get it. No one leaves.” He lunges. You move to dodge, but not fast enough. Everything goes cold. GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"crew_113": {
"text": "You swing the prybar. It hits his shoulder with a heavy crack. He drops the scalpel. He stumbles, groaning, and backs toward the wall. You don’t wait. You grab the scalpel and run. Behind you, Harlan doesn’t follow. Ahead, the hallway lights flicker toward a door marked: Escape Access",
"choices": [
{"text": "Choice 1: Head for the escape door.", "next": "escape_intro"},
]
},
"escape_intro": {
"text": "You go to the pod bay. The doors flash red—emergency lockdown engaged. The ship's AI chimes in: 'Escape pods are unavailable. Please go to the safe room'. Something seems off-putting about this AI. ",
"choices": [
{"text": "Choice 1: Try to override the disabled lock for the escape pods. You have a fishy feeling about this AI system. ", "next": "override_intro"},
{"text": "Choice 2: Ask the AI system for help with overriding the escape pod lock. The AI system chimes in 'You can certainly try to decipher the escape pod code, but I am only giving you three hints. Going to the safe room is your best bet'", "next": "hint_intro"},
{"text": "Choice 3: Search for another way off ", "next": "escape_intro"},
{"text": "Choice 4: Go to safe room, the AI sounds suspicious, but it is probably okay! ", "next": "saferoom_ending "},
]
},
"hint_intro": {
"text": "The AI chimes in, 'I see you have opted to get clues to disable the escape pod lock. This is unadvisable; however, the first clue is as follows: 'this is a 5 letter word that describes the area in between things. You can opt for another clue or try to disable the locks with what you have, but I still recommend you go to the safe room.' ",
"choices": [
{"text": "Choice 1: Try to override the disabled lock for the escape pods. You know what the word is!", "next": "override_intro"},
{"text": "Choice 2: Ask the AI system for another clue. That clue wasn't enough and it did say you have two more left! ", "next": "hint_two"},
{"text": "Choice 3: Search for another way off ", "next": "escape_intro"},
{"text": "Choice 4: Go to safe room, the AI sounds suspicious, but it is probably okay! ", "next": "saferoom_ending "},
]
},
"hint_two": {
"text": "The AI chimes in, seeming very annoyed at this point. 'I told you go to the safe room! But if you insist here is your second clue: this is a dark place where large objects float. You can get one more clue or like I have said before, you can go to the safe room and be just fine. ",
"choices": [
{"text": "Choice 1: Try to override the disabled lock for the escape pods. After two clues you definitely have it down!", "next": "override_intro"},
{"text": "Choice 2: Ask the AI system for one more clue. You want all the hints you can get.", "next": "hint_three"},
{"text": "Choice 3: Search for another way off", "next": "escape_intro"},
{"text": "Choice 4: Go to safe room, the AI is insisting so you should probably go. ", "next": "saferoom_ending "},
]
},
"hint_three": {
"text": "The AI is very annoyed now. 'This is your third and final clue. Asking for more clues may have... consequences... going to the safe room is the best choice still. But if you must, take this clue and try your luck at disabling the lock. The final clue is: 'this is a place where astronauts like to go'. Good luck. ",
"choices": [
{"text": "Choice 1: Try to override the disabled lock for the escape pods. You know what you're doing now!", "next": "override_intro"},
{"text": "Choice 2: Ask the AI system for just one more clue and see what these 'consequences' are.", "next": "hint_ending"},
{"text": "Choice 3: Search for another way off", "next": "escape_intro"},
{"text": "Choice 4: Go to safe room, you can't figure out the clue and that is probably your best bet.", "next": "saferoom_ending "},
]
},
"hint_ending": {
"text": "The entire system shuts down and everything goes dark. Suddenly you feel the ship start to crash and then everything goes black. GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"override_intro": {
"text": "You go to the control panel in the escape room to override the locks. As you begin typing in the code, you hear a voice that says 'WARNING, you have three attempts to override the locks and escape.' You look at the panel and you see three different options for what the code could be. ",
"choices": [
{"text": "Choice 1: The 'Spaceship' Option looks like the correct one! You choose that.", "next": "override_two"},
{"text": "Choice 2: The 'Void' Option looks like the correct one! You choose that.", "next": "override_two"},
{"text": "Choice 3: The 'Space' Option looks like the correct one! You choose that.", "next": "correct_code"},
{"text": "Choice 4: You are unsure of the code and want some hints. You go to the system's AI panel to see if you can get any hints", "next": "hint_intro"},
]
},
"override_two": {
"text": "That answer is incorrect, WARNING, your next guess is your last one. A failed guess could cause a system shutdown. Proceed?'",
"choices": [
{"text": "Choice 1: The 'Spaceship' Option looks like the correct one! You choose that.", "next": "override_ending"},
{"text": "Choice 2: The 'Void' Option looks like the correct one! You choose that.", "next": "override_ending"},
{"text": "Choice 3: The 'Space' Option looks like the correct one! You choose that.", "next": "correct_code"},
{"text": "Choice 4: Maybe you should get some hints. You go to the system's AI panel to see if you can get any hints", "next": "hint_intro"},
]
},
"correct_code": {
"text": "Congratulations! That answer is correct! Please proceed to the escape pods and head for your home plant!' YOU WIN! ",
"choices": [
{"text": "Choice 1: Experience other paths and restart game.", "next": "start"},
]
},
"override_ending": {
"text": "That answer is... incorrect' The entire system shuts down and everything goes dark. Suddenly you feel the ship start to crash and then everything goes black. GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"saferoom_ending": {
"text": "You go to the safe room. The door immediately locks and the room explodes. GAME OVER!",
"choices": [
{"text": "Restart game.", "next": "start"},
]
},
"vents_intro": {
"text": "The first sign comes as a distant metallic scratching, echoing through the ventilation system. It starts faint just on the edge of hearing then grows clearer. scritch-scritch-scratch. The sound moves with purpose, following the path of the ducts overhead. Whatever's making it seems to pause occasionally, as if listening or searching. The rhythm is wrong for maintenance bots. Too erratic. Too... alive.The scratching stops directly above. In the sudden silence, you can hear the soft whir of servo motors and the quiet ping of cooling metal. Then, ever so slightly, the vent cover trembles.",
"choices": [
{"text": "Choice 1: Hold your breath and listen - every detail could matter", "next": "Stop_and_listen_1"},
{"text": "Choice 2: Move quickly but quietly into a defensive position", "next": "Ready_defensive_position_1"},
{"text": "Choice 3: Signal for immediate evacuation while there's still time", "next": "Begin_immediate_evacuation_1"},
]
},
"Stop_and_listen_1": {
"text": "You freeze in place, straining to track the sounds above. The metallic scratching traces a deliberate path through the ventilation system—first forward, then branching left toward the maintenance bay. The pattern seems almost... coordinated. Your concentration breaks as Mason's voice cuts through the silence, barely a whisper: 'Wait... did you hear that?' A second set of scratches echoes from a different section of the vents, overlapping with the first. Then a third.The sounds converge and separate in an unsettling dance overhead, like a well-practiced routine. Mason's face goes pale. 'They're... they're working together.'",
"choices": [
{"text": "Choice 1: Let out an involuntary scream as realization hits", "next": "Scream_1"},
{"text": "Choice 2: There's more of them... they're hunting in packs", "next": "More_1"},
]
},
"Scream_1": {
"text": "Your scream pierces the silence—and everything happens at once. A deafening screech of tearing metal answers from above as claws rip through the vent cover like paper. In the flashing emergency lights, you catch glimpses of gleaming metal and too many limbs moving too fast. The creature drops from the ceiling in a fluid, predatory motion. Servos whir and joints click as it rights itself, its frame unfolding like some terrible mechanical spider. Multiple sensor arrays lock onto your position, glowing a deep, pulsing red. The distance between you and it is closing fast—much too fast. Each step of its blade-like legs leaves deep scratches in the metal floor. There's no time to think, only react.",
"choices": [
{"text": "Choice 1: Move quickly but quietly into a defensive position", "next": "Ready_defensive_position_1"},
{"text": "Choice 2: Signal for immediate evacuation while there's still time", "next": "Begin_immediate_evacuation_1"},
]
},
"Ready_defensive_position_1": {
"text": "You quickly organize your team—Mason barricades the door with storage crates while Sarah activates the emergency shields over the vents. The hydraulic plates slide into place with a heavy clang. You grab what you can: a fallen security baton still humming with power and a maintenance torch. Not much, but better than nothing. BANG The blast shields shudder. The creatures are testing them, hitting multiple points at once. Each impact leaves deeper dents. You have moments, at best.",
"choices": [
{"text": "Choice 1: Sprint for Engineering - the heavy equipment might give us a fighting chance", "next": "Run_to_Engineering_Bay"},
{"text": "Choice 2: Make a break for Security - we need real weapons", "next": "Run_to_Security_Station"},
{"text": "Choice 3: Muster all your strength and bolt towards the escape pods.", "next": "escape_intro"},
]
},
"Run_to_Engineering_Bay": {
"text": "The Engineering Bay doors hiss shut behind you. Tools line the walls, each with their own risks and advantages. Time to choose, and choose fast—metallic scratching echoes from somewhere in the ventilation above. The laser welder sits ready in its charging station, beam fully powered. The plasma cutter's fuel gauge reads half-full, its safety lock still engaged. And there, mounted on the workbench, the industrial hydraulic wrench gleams dully in the emergency lighting.",
"choices": [
{"text": "Choice 1: Laser Welder - Steady power, but the bright beam will give away your position", "next": "Laser_Welder"},
{"text": "Choice 2: Plasma Cutter - Devastating but loud, with limited fuel reserves", "next": "Plasma_Cutter"},
{"text": "Choice 3: Hydraulic Wrench - Heavy but reliable, and can seal doors behind you", "next": "Hydrawlic_Wrench_ending"},
]
},
"Plasma_Cutter": {
"text": "The plasma cutter roars to life, its blue beam slicing through the darkness. The creature lunges—your first shot catches its midsection, melting through armor with a deafening crack. It screams, synthetic flesh burning. You fire again, watching the fuel gauge drop critically low. One final shot. The creature rises, and you take your chance—the plasma beam punches through its core. It collapses in a smoking heap, but the echoing sounds of your fight are already drawing attention from the shadows.",
"choices": [
{"text": "Choice 1: Grab the net - this might be your only chance to capture it", "next": "Grab_net"},
{"text": "Choice 2: Leave it - don't risk getting closer", "next": "Leave_net"},
]
},
"Hydrawlic_Wrench_ending": {
"text": "The hydraulic wrench feels reassuringly solid in your hands. Its weight might slow you down, but at least you can seal doors behind you— A sharp CRACK splits the air. Too late, you look up. The vent cover dangles by a single bolt, already torn open. In the darkness above, multiple red sensor arrays blink to life. The creatures were here all along, waiting. Metal limbs unfold from the ceiling in a horrifying cascade. The wrench drops from your hands, too slow, too heavy to matter now. The last thing you see is a blur of chrome and crimson lights. [TERMINAL STATUS: OFFLINE] GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"Laser_Welder": {
"text": "The welder's beam cuts through the darkness—first shot catches the creature mid-leap, scoring its metallic shell. It recoils with an electronic shriek. Second blast hits something vital—sparks cascade from its joints, but it's still moving. You squeeze the trigger again. Nothing. Power indicator flashes red. Empty. Through the fading sparks, you spot a heavy industrial net tangled in the nearby workstation. The creature writhes on the floor, damaged but definitely not destroyed. Its movements are erratic now, but those claws still look deadly.",
"choices": [
{"text": "Choice 1: Grab the net - this might be your only chance to capture it", "next": "Grab_net"},
{"text": "Choice 2: Leave it - don't risk getting closer", "next": "Leave_net"},
]
},
"Grab_net": {
"text": "Your hands find the net and you throw it with desperate force. The creature thrashes, becoming more entangled with each movement. As it weakens, you get your first clear look: A Sentinel. The squid-like machine's multiple arms end in various tools and weapons, its red sensor array still pulsing weakly. This shouldn't be possible—these were just stories, warnings from the old war. But here it is, proof that someone has been recreating the machines that nearly ended humanity. [TERMINAL STATUS: OFFLINE] GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"Leave_net": {
"text": "You edge toward the exit, but the creature isn't finished. With terrifying speed, it launches itself at you. White-hot pain explodes across your ribs as its claws tear through your suit. You stumble backward through the doorway as the creature retreats into the shadows, leaving you with nothing but a bleeding wound and the unsettling memory of what you glimpsed in those final seconds—a nightmare fusion of machine and flesh. [TERMINAL STATUS: OFFLINE] GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"Run_to_Security_Station": {
"text": "The Security Station door slides shut with a reassuring click. Rows of monitors illuminate your face as you activate the aging camera network. Static clears from the screens one by one, revealing different sections of the facility. You lean closer, adjusting the focus. There they are—three Sentinels. The machines move with disturbing precision, their metallic tentacles probing into maintenance shafts and ventilation ducts. One appears damaged, trailing sparks as it moves. The other two are intact, their red sensor arrays methodically scanning every corner. The defense systems are at your fingertips. Turrets, blast doors, electromagnetic pulses—enough firepower to shred them to pieces. But these are living proof of something impossible. Someone has recreated humanity's oldest mechanical enemy, and these might be the only evidence. The cameras track their movement. They're searching for something... or someone. The question isn't just about survival anymore—it's about what happens next. Do you want to kill them?",
"choices": [
{"text": "Choice 1: Yes", "next": "Run_to_Engineering_Bay"},
{"text": "Choice 2: No", "next": "Begin_immediate_evacuation_1"},
{"text": "Choice 3: Hesitate", "next": "Cornered"},
]
},
"Begin_immediate_evacuation_1": {
"text": "EMERGENCY EVACUATION PROTOCOL INITIATED Red warning lights pulse through the corridors. You need to get out—now. The main exit is two levels up. The creatures' movements on the security feeds become more agitated as the alarm echoes through the facility.",
"choices": [
{"text": "Choice 1: Run - Sprint for the emergency stairwell. Speed over stealth", "next": "Run"},
{"text": "Choice 2: Retreat slowly - Take the maintenance paths. Quiet but longer.", "next": "Cornered"},
]
},
"Run": {
"text": "Your footsteps thunder down the metal corridors. The evacuation siren masks some of the noise, but not enough. Behind you, mechanical whirring grows closer. A quick glance back confirms your fear—two Sentinels, their red sensors fixed on your position. They're closing in, moving faster than you thought possible. The exit is still so far...",
"choices": [
{"text": "Choice 1: You try your best to move quickly but quietly into a defensive position", "next": "Ready_defensive_position_1"},
{"text": "Choice 2: Muster all your strength and bolt towards the escape pods.", "next": "escape_intro"},
]
},
"Cornered": {
"text": "You ease through the maintenance tunnels, counting your steps, controlling your breathing. The narrow paths should be harder for them to navigate. A wrong turn leads to a dead end. As you turn back, mechanical sounds echo from both directions. The creatures have split up, cutting off your escape routes. The walls feel closer, tighter. You're cornered.",
"choices": [
{"text": "Choice 1: Your back pressed against cold steel, you spot a familiar service hatch—Engineering Bay access. ", "next": "Run_to_Engineering_Bay"},
{"text": "Choice 2: Your mind races through options, precious seconds ticking away as indecision paralyzes you.", "next": "Dead_hesitate"},
{"text": "Choice 3: Muster all your strength and bolt towards the escape pods.", "next": "escape_intro"},
]
},
"Dead_hesitate": {
"text": "Three seconds: The whirring grows louder. Four seconds: Red sensor lights reflect off the steel walls. Five seconds: Too late. They strike from both sides. Multiple mechanical arms tear through the confined space with lethal precision. The last thing you see is the cold gleam of their metallic forms, red sensors pulsing as they close in. Your hesitation was fatal. [TERMINAL STATUS: OFFLINE] GAME OVER.",
"choices": [
{"text": "Choice 1: Restart game.", "next": "start"},
]
},
"More_1": {
"text": "The whispered realization barely leaves your lips when the scratching patterns change. They've heard you—somehow they've heard you. The mechanical sounds shift from search patterns to something else: precise, coordinated movement. Like wolves circling prey. The Sentinels aren't just machines anymore—they're a coordinated hunting party. And you've just identified yourself as prey.",
"choices": [
{"text": "Choice 1: Move quickly but quietly into a defensive position", "next": "Ready_defensive_position_1"},
{"text": "Choice 2: Signal for immediate evacuation while there's still time", "next": "Begin_immediate_evacuation_1"},
]
}
        // Add more scenes as needed
    }
};
// Initialize the game
function initGame() {
    // Set up click-to-begin
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.getElementById('game-container');
    
    // Show start screen initially
    startScreen.style.display = 'block';
    gameContainer.style.display = 'none';
    
    // Initialize audio and other setup
    unlockAudio();
    setupControls();
    setupSettingsMenu();
    document.getElementById('rate-value').textContent = gameState.speechRate.toFixed(1);
    
    // Handle click to start
    startScreen.addEventListener('click', () => {
        startGame();
    });
    
    // Also allow any key press to start
    document.addEventListener('keydown', function startGameListener(e) {
        startGame();
        document.removeEventListener('keydown', startGameListener);
    }, { once: true });
    
    function startGame() {
        startScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        document.body.style.cursor = 'none'; // Hide cursor when game starts
        
        // Focus and display first scene
        gameContainer.focus();
        displayScene(gameState.currentScene);
        
        // Speak welcome message
        speak("Welcome to Locked in Orbit. Use up/down arrows to choose, Enter to select, Space to repeat text. Press S for settings.");
    }
    
    // For accessibility, ensure cursor returns when tabbing to controls
    document.getElementById('settings-btn').addEventListener('focus', () => {
        document.body.style.cursor = 'default';
    });
    
    document.getElementById('game-container').addEventListener('focus', () => {
        if (startScreen.style.display === 'none') {
            document.body.style.cursor = 'none';
        }
    });
}


// Display a scene and its choices
function displayScene(sceneId) {
    gameState.speechSynth.cancel();
    gameState.sceneTextFinished = false;
    gameState.choicesLocked = true;
    
    const scene = gameState.scenes[sceneId];
    if (!scene) return;

    // Play transition sound
    sceneTransitionSound.play().catch(e => {
        console.log("Audio play failed:", e);
        unlockAudio();
    });

    gameState.currentScene = sceneId;
    gameState.selectedChoice = 0;
    
    document.getElementById('scene-text').textContent = scene.text;
    
    const choicesElement = document.getElementById('choices');
    choicesElement.innerHTML = '';
    
    if (scene.choices && scene.choices.length > 0) {
        // Add locked overlay
        choicesElement.classList.add('choices-locked');
        
        scene.choices.forEach((choice, index) => {
            const choiceElement = document.createElement('div');
            choiceElement.className = 'choice';
            choiceElement.textContent = choice.text;
            choiceElement.setAttribute('role', 'menuitem');
            choiceElement.setAttribute('tabindex', '-1');
            if (index === 0) {
                choiceElement.classList.add('selected');
            }
            choicesElement.appendChild(choiceElement);
        });
    }
    
    // Speak the scene text
    speak(scene.text);
    
    // When scene text finishes
    gameState.speechUtterance.onend = () => {
        gameState.sceneTextFinished = true;
        gameState.choicesLocked = false;
        document.getElementById('choices').classList.remove('choices-locked');
        
        if (scene.choices && scene.choices.length > 0) {
            // Immediately read the first choice when scene text finishes
            readCurrentChoice();
        }
    };
}

function readCurrentChoice() {
    const scene = gameState.scenes[gameState.currentScene];
    if (!scene || !scene.choices || gameState.selectedChoice >= scene.choices.length) return;
    
    // Changed to interrupt=true to allow cutting off previous choice
    speak(scene.choices[gameState.selectedChoice].text, true);
}

function speak(text, interrupt = true) {
    if (gameState.isSpeaking && !interrupt) {
        return;
    }
    
    // Cancel any current speech if interrupting
    if (interrupt) {
        gameState.speechSynth.cancel();
        gameState.isSpeaking = false;
    }
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = gameState.speechRate;
    
    utterance.onboundary = (event) => {
        if (event.name === 'word') {
            gameState.lastSpokenWord = event.charIndex;
        }
    };
    
    utterance.onend = () => {
        gameState.isSpeaking = false;
        gameState.pausedUtterance = null;
        gameState.pausedTextPosition = 0;
    };
    
    gameState.isSpeaking = true;
    gameState.speechUtterance = utterance;
    gameState.speechSynth.speak(utterance);
}

function openSettingsMenu() {
    gameState.isSettingsOpen = true;
    const menu = document.getElementById('settings-menu');
    menu.hidden = false;
    document.body.classList.remove('game-active'); // Show cursor in settings
    document.body.classList.add('menu-open');
    gameState.settingsFocusedElement = document.activeElement;
    document.getElementById('close-settings').focus();
    speak("Settings menu opened. Current speech rate is " + gameState.speechRate.toFixed(1) + 
         ". Use up/down arrows to adjust rate. Press Enter to confirm or Escape to close.", true);
}

function closeSettingsMenu() {
    gameState.isSettingsOpen = false;
    const menu = document.getElementById('settings-menu');
    menu.hidden = true;
    document.body.classList.remove('menu-open');
    document.body.classList.add('game-active'); // Hide cursor again
    document.getElementById('game-container').focus();
    speak("Settings menu closed. Current speech rate is " + gameState.speechRate.toFixed(1));
}

function adjustSpeechRate(change) {
    gameState.speechRate = Math.min(Math.max(gameState.speechRate + change, 0.5), 10);
    document.getElementById('rate-value').textContent = gameState.speechRate.toFixed(1);
    speak("Rate set to " + gameState.speechRate.toFixed(1), true);
}

// Set up settings menu
function setupSettingsMenu() {
    const settingsBtn = document.getElementById('settings-btn');
    const closeBtn = document.getElementById('close-settings');
    const increaseBtn = document.getElementById('increase-rate');
    const decreaseBtn = document.getElementById('decrease-rate');
    
    settingsBtn.addEventListener('click', openSettingsMenu);
    closeBtn.addEventListener('click', closeSettingsMenu);
    increaseBtn.addEventListener('click', () => adjustSpeechRate(0.1));
    decreaseBtn.addEventListener('click', () => adjustSpeechRate(-0.1));
    
    document.getElementById('settings-menu').addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSettingsMenu();
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            adjustSpeechRate(0.1);
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            adjustSpeechRate(-0.1);
            e.preventDefault();
        }
    });
}

function setupControls() {
    const gameContainer = document.getElementById('game-container');
    
    gameContainer.addEventListener('keydown', (e) => {
        if (gameState.isSettingsOpen) return;
        
        const scene = gameState.scenes[gameState.currentScene];
        if (!scene) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (gameState.choicesLocked) {
                    return;
                }
                if (scene.choices && scene.choices.length > 0) {
                    // Play hover sound before changing selection
                    if (gameState.audioEnabled) {
                        choiceHoverSound.currentTime = 0; // Rewind sound if already playing
                        choiceHoverSound.play().catch(e => console.log("Hover sound error:", e));
                    }
                    
                    gameState.selectedChoice = Math.min(gameState.selectedChoice + 1, scene.choices.length - 1);
                    updateSelectedChoice();
                    readCurrentChoice();
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (gameState.choicesLocked) {
                    return;
                }
                if (scene.choices && scene.choices.length > 0) {
                    // Play hover sound before changing selection
                    if (gameState.audioEnabled) {
                        choiceHoverSound.currentTime = 0;
                        choiceHoverSound.play().catch(e => console.log("Hover sound error:", e));
                    }
                    
                    gameState.selectedChoice = Math.max(gameState.selectedChoice - 1, 0);
                    updateSelectedChoice();
                    readCurrentChoice();
                }
                break;
                
            case 'ArrowRight':
                // Skip current narration
                e.preventDefault();
                gameState.speechSynth.cancel();
                gameState.isSpeaking = false;
                
                if (!gameState.sceneTextFinished) {
                    // If scene text was playing, mark it as finished and unlock choices
                    gameState.sceneTextFinished = true;
                    gameState.choicesLocked = false;
                    document.getElementById('choices').classList.remove('choices-locked');
                    
                    if (scene.choices && scene.choices.length > 0) {
                        readCurrentChoice();
                    }
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                if (gameState.choicesLocked) {
                    return;
                }
                if (scene.choices && scene.choices.length > 0 && 
                    gameState.selectedChoice < scene.choices.length) {
                    const nextScene = scene.choices[gameState.selectedChoice].next;
                    if (nextScene) {
                        displayScene(nextScene);
                    }
                }
                break;
                
            case ' ':
                e.preventDefault();
                if (!gameState.sceneTextFinished) {
                    return;
                }
                speak(scene.text);
                break;
                
            case 's':
            case 'S':
                openSettingsMenu();
                e.preventDefault();
                break;
        }
    });
}

// Update the visual selection of choices
function updateSelectedChoice() {
    const choices = document.querySelectorAll('.choice');
    choices.forEach((choice, index) => {
        if (index === gameState.selectedChoice) {
            choice.classList.add('selected');
            choice.setAttribute('aria-selected', 'true');
        } else {
            choice.classList.remove('selected');
            choice.setAttribute('aria-selected', 'false');
        }
    });
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', initGame);