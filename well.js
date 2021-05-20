// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @icon         https://www.google.com/s2/favicons?domain=google.com
// @match        *://vk.com/*
// @grant GM_addStyle
// ==/UserScript==

//console.log(["Tm running", location.search]);
if (/\bsel=-182985865\b/.test (location.search) ) {

	// eventMachine START
	//console.log("Event machine start");
	const subscriptions = { }

	let getIdGenerator = function () {
		let lastId = 0

		return function getNextUniqueId() {
			lastId += 1
			return lastId
		}
	}

	const getNextUniqueId = getIdGenerator()

	let subscribe = function (eventType, callback) {
		const id = getNextUniqueId()

		if(!subscriptions[eventType])
			subscriptions[eventType] = { }

		subscriptions[eventType][id] = callback

		return {
			unsubscribe: () => {
				delete subscriptions[eventType][id]
				if(Object.keys(subscriptions[eventType]).length === 0) delete subscriptions[eventType]
			}
		}
	}

	let publish = function (eventType, arg) {
		if(!subscriptions[eventType])
			return

		Object.keys(subscriptions[eventType]).forEach(key => subscriptions[eventType][key](arg))
	}

	const event_names = {
		"change_action": 1,
		'before_action_change': 12,
		'after_action_change': 13,
	}
	//console.log("Event machine end");
	// eventMachine END

	const constants = {
		"WELL_HREF": "https://vk.com/welldungeon"
	}

	const texts = {
		"GRAB_FISH": "Поплавок полностью ушел под воду!",
	}

	const actions = {
		"progress": 1,
		"fight": 2,
		"rest": 3,
		'fishing_hub': 4,
		'interrupt': 5,
		'use_potion': 6,
		'lesser_action': 7,
		'stand_in_hub': 8,
		'grab_fish': 9,
	}

	let player_state = {
		"running": false,
		"hp": -1,
		"max_hp": -1,
		"getHealthPercentage": function() {
			return this.hp / this.max_hp;
		},
		"action": actions.progress,
		"fishing": {
			"bait_left": 0,
			'grab_fish': false
		},
		"fight": {
			'using_potion': false,

			'heal_used': false,
			'potions': -1,
			'used_potion': false,
			'enemy_max_hp': null,
			'enemy_hp': null,
			'enemy_damage': null,
			'damage_to_enemy': null,
		},
		"confirm_exit": false
	}	

	// buttons START
	//console.log("Buttons start");

	let button_labels = {
		"well": "В колодец",
		'prepare_meal': 'Приготовить пищу',
		"progress": "Исследовать уровень",
		"rest": "Отдых",
		"heal_skill": "|Слабое исцеление|",
		"shadow_skill": "|Сила теней|",
		"split_skill": "|Раскол|",
		"attack": "Атака",
		"use_potion": "Зелье",
		"flee": "Сбежать",
		"skin": "Освеживать",
		"search": "Обыскать",
		"interrupt": "Прервать",
		"fishing": {
			"start_fishing": "Закинуть удочку",
			"stop_fishing": "Прервать рыбалку",
			"grab_fish": "Подсечь",
		}
	}

	let button_helper = {
		"is_button_available": (text) => {
			for (btn of document.querySelectorAll('button[type="text"]')) {
				for (chd of btn.childNodes) {
					if (chd.tagName == "SPAN" && chd.innerText == text) {
						return true;
					}
				}
			}
			return false;
		}
	}

	let press_button = (text) => {
		/*if (!button_helper.is_button_available(text)) {
			console.log(["Unable to find", text]);
			return;
		}*/
		console.log(["Going to press", text]);
		for (btn of document.querySelectorAll('button[type="text"]')) {
			for (chd of btn.childNodes) {
				if (chd.tagName == "SPAN" && chd.innerText == text) {
					//console.log("Pressed");
					chd.click();
					return;
				}
			}
		}
		console.log(["Unable to find", text]);
	}

	let press_lesser_button = () => {
		let buttons = document.querySelectorAll('span[class=MessageKeyboard__label]');
		let button = buttons[buttons.length - 1];
		//console.log(["Going to press lesser"]);
		button.click();
	};

	//console.log("Buttons end");
	// buttons END

	let base_subscriber = (action, callback) => {
		subscribe(event_names.change_action, function(arg) {
			if (arg.action == action) {
				callback(arg);
			}
		});
	}

	let subscribers = {
		'rest': base_subscriber(actions.rest, function(arg) {
			if (button_helper.is_button_available(button_labels.prepare_meal)) {
				press_button(button_labels.prepare_meal);
			}
		}),
		'use_potion': base_subscriber(actions.use_potion, function(arg) {
			if (player_state.fight.used_potion) {
				publish(event_names.change_action, {"action": actions.fight});
			}
			player_state.fight.used_potion = true;
		}),
		'interrupt': base_subscriber(actions.interrupt, function(arg) {
			press_button(button_labels.interrupt);
		}),
		'fishing_hub': base_subscriber(actions.fishing_hub, function(arg) {	
			if (player_state.fishing.bait_left > 0 && button_helper.is_button_available(button_labels.fishing.start_fishing)) {
				press_button(button_labels.fishing.start_fishing);
			} else if (button_helper.is_button_available(button_labels.fishing.stop_fishing)) {
				press_button(button_labels.fishing.stop_fishing);
				player_state.confirm_exit = true;
			}
		}),
		'progress': base_subscriber(actions.progress, function(arg) {	
			console.log('Guessing progressing...');
		}),
		'stand_in_hub': base_subscriber(actions.stand_in_hub, function(arg) {
			if (player_state.getHealthPercentage() < 0.8) {
				if (button_helper.is_button_available(button_labels.rest)) {
					press_button(button_labels.rest);
					//publish(event_names.change_action, {"action": actions.rest});
				}
				return;
			}
	
			press_button(button_labels.progress);
		}),
		'fight': base_subscriber(actions.fight, function(arg) {
			let how_many_hits_left = player_state.fight.enemy_damage
				? (player_state.hp / (player_state.fight.enemy_damage *1.1))
				: 9999;
		
			if (how_many_hits_left < 2) {
				//console.log("Going to use potion");
				press_button(button_labels.use_potion);
				player_state.fight.using_potion = true;
				return;
			}
	
			if (how_many_hits_left < 4 && button_helper.is_button_available(button_labels.heal_skill)) {
				press_button(button_labels.heal_skill);
			} 
			
			if (button_helper.is_button_available(button_labels.split_skill)) {
				press_button(button_labels.split_skill);
			} else if (button_helper.is_button_available(button_labels.shadow_skill)) {
				press_button(button_labels.shadow_skill);
			} else {
				press_button(button_labels.attack);
			}
	
			player_state.fight.used_potion = false;
		}),
		'lesser_action': base_subscriber(actions.lesser_action, function(arg) {
			press_lesser_button();
		}),
		'grab_fish': base_subscriber(actions.grab_fish, function(arg) {
			if (player_state.fishing.grab_fish) {
				press_button(button_labels.fishing.grab_fish);
				return;
			}
		}),
		'after_action_change': () => {
			subscribe(event_names.after_action_change, (arg) => {
				if (arg.action) {
					player_state.action = arg.action;
				}
			});
		},
	};

	let subscribe = () => {
		for(sub in subscribers) {
			sub();
		}
	};
	subscribe();

	let determine_next_action = (next_action_state) => {
		if (next_action_state.lesser_action_available) {
			if (player_state.fight.using_potion) {
				return actions.use_potion;
			}
			return actions.lesser_action;
		}

		if (button_helper.is_button_available(button_labels.fishing.grab_fish)) {
			return actions.grab_fish;
		}
		
		if (button_helper.is_button_available(button_labels.prepare_meal)) {
			return actions.rest;
		}

		if (button_helper.is_button_available(button_labels.fishing.start_fishing)) {
			player_state.fishing.bait_left = next_action_state.fishing.bait_left;
			return actions.fishing_hub;
		}

		if (button_helper.is_button_available(button_labels.progress)) {
			return actions.stand_in_hub;
		}

		if (button_helper.is_button_available(button_labels.attack)) {
			return actions.fight;
		}

		if (player_state.confirm_exit && button_helper.is_button_available(button_labels.interrupt)) {
			return actions.interrupt;
		}

		return player_state.progress;
	};
	
	let update_current_state = (next_action_state) => {		
		let update_health = () => {
			if (next_action_state.player_hp) {
				player_state.hp = next_action_state.player_hp;
			}

			if (next_action_state.player_max_hp) {
				player_state.max_hp = next_action_state.player_max_hp;
			}
		};

		let update_enemy_health = () => {
			if (next_action_state.fight.enemy_hp) {
				player_state.fight.enemy_hp = next_action_state.fight.enemy_hp;
			}

			if (next_action_state.fight.enemy_max_hp) {
				player_state.fight.enemy_max_hp = next_action_state.fight.enemy_max_hp;
			}
		}

		let calculate_damage = (old_hp, new_hp, whos_damage) => {
			if (old_hp && new_hp && new_hp < old_hp) {
				let diff = old_hp - new_hp;
				if (!whos_damage) {
					return diff;
				} else {
					return whos_damage > diff
							? whos_damage
							: diff;
				}
			}
			return null;
		}
		let update_enemy_damage = () => {
			player_state.fight.enemy_damage = calculate_damage(
				player_state.hp,
				next_action_state.player_hp,
				player_state.fight.enemy_damage
			);
			//console.log(['Enemy damage', player_state.fight.enemy_damage]);
		}
		let update_damage_to_enemy = () => {
			player_state.fight.damage_to_enemy = calculate_damage(
				player_state.fight.enemy_hp,
				next_action_state.fight.enemy_hp,
				player_state.fight.damage_to_enemy
			);
			//console.log(['Player damage', player_state.fight.damage_to_enemy]);
		}

		let update_grab_fish = () => {
			player_state.fishing.grab_fish = next_action_state.fishing.grab_fish;
		}

		update_health();
		update_enemy_health();
		update_enemy_damage();
		update_damage_to_enemy();
		update_grab_fish();
	};

	let doNextAction = function(next_action_state) {
		//console.log("Going to do next action");
		let next_action = determine_next_action(next_action_state);
		if (!next_action) {
			return;
		}

		update_current_state(next_action_state);
		player_state.action = next_action;
		publish(event_names.before_action_change, {"action": next_action});
		publish(event_names.change_action, {"action": next_action});
		publish(event_names.after_action_change, {"action": next_action});
	}

	//console.log("Main logic end");

	let timeoutDelay = 3000;
	const delay = ms => new Promise(res => setTimeout(res, ms));

	let collectNextStateSource = () => {
		//console.log("Analyse last messages");
		var messages = document.querySelectorAll('div[class="im-mess-stack _im_mess_stack "]');
		//console.log(messages);
		let last_messages = [];
		let index = messages.length - 1;
		//console.log(index);
		while (index >= 0) {
			let message = messages[index];
			let link = message.getElementsByClassName('im_grid')[0];
			//console.log(["link", link, link.tagName == "A", link.href == constants.WELL_HREF]);
			if (link.tagName == "A") {
				if (link.href == constants.WELL_HREF) {
					last_messages.push(message);
					//console.log("Valid link");
				} else {
					break;
				}
			}
			index--;
		}

		//console.log(last_messages);
		if (last_messages.length == 0) {
			return {"error": "No messages"};
		}
		//console.log("Got some messages");
		let next_state_source = {
			"player_hp": null,
			"player_max_hp": null,
			"lesser_action_available": false,
			"next_hp_is_player": false,
			"next_hp_is_enemy": false,
			"fishing": {
				"bait_next": false,
				"bait_left": 0,
				"grab_fish": false,
				"is": false,
			},
			"fight": {
				'enemy_max_hp': null,
				'enemy_hp': null,
			},
		}
		for (last_message of last_messages) {
			//console.log(['lm',last_message]);
			let list = last_message.getElementsByClassName('ui_clean_list im-mess-stack--mess _im_stack_messages')[0];
			//console.log(['list', list]);
			list.childNodes.forEach((item) => {
				//console.log(['item',item]);
				if(item.childNodes.length != 0) {
					let content = item.getElementsByClassName('im-mess--text wall_module _im_log_body');
					//console.log(['content', content]);
					content.forEach((contentItem) => {
						//console.log(['cI', contentItem]);
						contentItem.childNodes.forEach((row) => {
							//console.log(["row", row]);
							if (row.nodeName == "#text") {
								if (player_state.fishing.bait_left > 0 && row.data == texts.GRAB_FISH) {
									next_state_source.fishing.grab_fish = true;
								}

								if (next_state_source.next_hp_is_player && row.data.startsWith("HP:")) {
									let text = row.data.split(' ')[1];
									let now = parseInt(text.split('/')[0]);
									let max = parseInt(text.split('/')[1]);
									next_state_source.player_hp = now;
									next_state_source.player_max_hp = max;
									next_state_source.next_hp_is_player = false;
								}

								if (next_state_source.next_hp_is_enemy && row.data.includes(": ")) {
									let text = row.data.split(': ')[1];
									text = text.split(' ')[0];
									let now = parseInt(text.split('/')[0]);
									let max = parseInt(text.split('/')[1]);
									next_state_source.fight.enemy_hp = now;
									next_state_source.fight.enemy_max_hp = max;
									next_state_source.next_hp_is_enemy = false;
								}

								if (next_state_source.fishing.bait_next) {
									let text = row.data.split(': ')[1];
									next_state_source.fishing.bait_left = parseInt(text);
									next_state_source.fishing.bait_next = false;
								}
							}

							if (row.tagName == 'DIV') {
								if (row.className.startsWith('_im_msg_media')) {
									let lesser = row.getElementsByClassName('MessageKeyboard');
									//console.log(lesser);
									const validLesser = (lesser) => {
										if (lesser.length <= 0) {
											return false;
										}
										let button = lesser[0].getElementsByClassName('MessageKeyboard__button MessageKeyboard__button--open-link Button Button--size-s Button--secondary _im_mess_btn');
										return button.length < 1 || !button[0].href;

									};
									let lesser_action_exists = validLesser(lesser);
									//console.log(['lae', lesser_action_exists]);
									if (lesser_action_exists) {
										next_state_source.lesser_action_available = true;
									}
								}
							}

							// 🗣 - без скилов, 🍄 - не поднимать

							if (row.tagName == 'IMG') {
								switch (row.alt) {
									case "💚":
										next_state_source.next_hp_is_player = true;
										break;
									case "❤":
										next_state_source.next_hp_is_enemy = true;
										break;
									case "🐛":
										next_state_source.fishing.bait_next = true
										next_state_source.fishing.is = true;
										break;
								}
							}
						});
					});
				}
			});

		}
		//console.log("State prepared");
		return next_state_source;
	}

	const mainLoop = async () => {
		//console.log(["Running", player_state.running]);
		if (!player_state.running) {
			return;
		}

		let next_state_source = collectNextStateSource();

		//console.log(last_message_result);
		if (next_state_source.hasOwnProperty('error')) {
			//console.log(last_message_result.error);
			return;
		}

		doNextAction(next_state_source);
	};

	let ui = {
		"createUi": function (main_player_state) {
			let zNode = document.createElement ('div');
			zNode.innerHTML = '<button id="myButton" type="button">Start/Stop</button>';

			zNode.setAttribute ('id', 'myContainer');
			document.body.appendChild (zNode);

			//--- Activate the newly added button.
			document.getElementById ("myButton").addEventListener("click", ButtonClickAction, false);


			let setRunningStateText = () => {
				document.getElementById ("myButton").innerText = main_player_state.running ? "Stop" : "Start";
				document.getElementById ("myButton").setAttribute('state', main_player_state.running ? "off" : "on");
			}
			setRunningStateText();
			function ButtonClickAction (zEvent) {
				main_player_state.running = !main_player_state.running;
				setRunningStateText();
			}

			//--- Style our newly added elements using CSS.
			GM_addStyle ( `
			#myContainer {
				position:               fixed;
				top:                    83.5%;
				left:                   62.5%;
				font-size:              20px;
				z-index:                1100;
			}
			#myButton {
				cursor:                 pointer;
			}
			#myButton[state='off'] {
				background-color: red;
			}
			#myButton[state='on'] {
				background-color: #32CD32;
			}
			` );
		}
	};

	ui.createUi(player_state);
	(async function() {
		do {
			await delay(timeoutDelay);
			mainLoop();
		} while(true);
	})();
	//console.log("Infinity ended");
}