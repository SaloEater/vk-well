(function(that){((context, fapply, console) => {with (context) {(module => {"use strict";try {fapply(module, context, [,,context.CDATA,context.uneval,context.define,context.module,context.exports,context,context.unsafeWindow,context.console,context.cloneInto,context.exportFunction,context.createObjectIn,context.GM,context.GM_info,context.GM_addStyle]);} catch (e) {if (e.message && e.stack) {console.error("ERROR: Execution of script 'New Userscript' failed! " + e.message);console.log(e.stack.replace(/(\\(eval at )?<anonymous>[: ]?)|([\s.]*at Object.tms_[\s\S.]*)/g, ""));} else {console.error(e);}}})(async function tms_b7324349_f0a4_4934_9955_a340f5154394(context,fapply,CDATA,uneval,define,module,exports,window,unsafeWindow,console,cloneInto,exportFunction,createObjectIn,GM,GM_info,GM_addStyle) {

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
			'fishing': 4,
			'interrupt': 5,
			'use_potion': 6,
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
			"server_response": 2,
			"progress": 3,
			"rest": 4,
			"fight": 5,
			"skin": 6,
			"search": 7,
			"lesser_action": 8,
			"fishing": 9,
			'interrupt': 10,
			'use_potion': 11,
		}
		//console.log("Event machine end");
		// eventMachine END
	
		// buttons START
		//console.log("Buttons start");
	
		let button_labels = {
			"well": "В колодец",
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
			"is_button_available": function(text) {
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
	
		let press_button = function(text) {
			if (!button_helper.is_button_available(text)) {
				console.log(["Unable to find", text]);
				return;
			}
			console.log(["Going to press", text]);
			for (btn of document.querySelectorAll('button[type="text"]')) {
				for (chd of btn.childNodes) {
					if (chd.tagName == "SPAN" && chd.innerText == text) {
						//console.log("Pressed");
						chd.click();
					}
				}
			}
		}
	
		let lesser_button = function(text) {
			//console.log(["Going to press", text]);
			let button;
			for (btn of document.querySelectorAll('button[data-label=' + text + ']')) {
				//console.log("Pressed");
				button = btn;
			}
			button.click();
		}
	
		let press_lesser_button = {
			"last": function() {
				let buttons = document.querySelectorAll('span[class=MessageKeyboard__label]');
				let button = buttons[buttons.length - 1];
				//console.log(["Going to press lesser"]);
				button.click();
			 },
			"skin": function() { lesser_button(button_labels.skin) },
			"search": function() { lesser_button(button_labels.search) },
		}
	
		//console.log("Buttons end");
		// buttons END
	
	
	
		// SUBS START
	
		subscribe(event_names.rest, function(arg) {
			press_button(button_labels.rest);
		});
	
		subscribe(event_names.use_potion, function(arg) {
			if (player_state.fight.used_potion) {
				publish(event_names.change_action, {"action": actions.fight});
			}
			//console.log("Going to use potion");
			//press_button(button_labels.use_potion);
			player_state.fight.used_potion = true;
		});
	
		subscribe(event_names.interrupt, function(arg) {
			press_button(button_labels.interrupt);
		});
	
		subscribe(event_names.fishing, function(arg) {
			if (player_state.fishing.grab_fish) {
				press_button(button_labels.fishing.grab_fish);
				return;
			}
	
			if (player_state.fishing.bait_left > 0) {
				press_button(button_labels.fishing.start_fishing);
				return;
			}
	
			press_button(button_labels.fishing.stop_fishing);
			player_state.confirm_exit = true;
		});
	
		subscribe(event_names.progress, function(arg) {
			if (player_state.getHealthPercentage() < 0.7) {
				publish(event_names.change_action, {"action": actions.rest});
				return;
			}
	
			press_button(button_labels.progress);
		});
	
		subscribe(event_names.fight, function(arg) {
			let how_many_hits_left = player_state.fight.enemy_damage
				? (player_state.hp /(player_state.fight.enemy_damage *1.1))
				: 9999;
	
			if (how_many_hits_left < 2) {
				publish(event_names.change_action, {"action": actions.use_potion});
				return;
			}
	
			if (how_many_hits_left < 4 && button_helper.is_button_available(button_labels.heal_skill)) {
				press_button(button_labels.heal_skill);
			} else if (button_helper.is_button_available(button_labels.split_skill)) {
				press_button(button_labels.split_skill);
			} else if (button_helper.is_button_available(button_labels.shadow_skill)) {
				press_button(button_labels.shadow_skill);
			} else {
				press_button(button_labels.attack);
			}
	
			player_state.fight.used_potion = false;
		});
	
		subscribe(event_names.lesser_action, function(arg) {
			press_lesser_button.last();
		});
	
		subscribe(event_names.change_action, function(arg) {
			if (arg.action != player_state.action) {
				player_state.action = arg.action;
				reactToActionChange();
			}
		});
	
		// SUBS END
		let determineCurrentAction = (next_action_state) => {
			let updateHealth = () => {
				if (next_action_state.player_hp) {
					player_state.hp = next_action_state.player_hp;
				}
	
				if (next_action_state.player_max_hp) {
					player_state.max_hp = next_action_state.player_max_hp;
				}
			};
	
			switch (player_state.action) {
				case actions.fishing:
					player_state.fishing.grab_fish = next_action_state.fishing.grab_fish;
					break;
			}
	
			if (next_action_state.fishing.is && button_helper.is_button_available(button_labels.fishing.start_fishing)) {
				player_state.fishing.bait_left = next_action_state.fishing.bait_left;
				updateHealth();
				publish(event_names.change_action, {"action": actions.fishing});
				return;
			}
	
			let progress_available = button_helper.is_button_available(button_labels.progress);
			if (player_state.action != actions.progress && progress_available) {
				updateHealth();
				publish(event_names.change_action, {"action": actions.progress});
				return;
			}
	
			let attack_available = button_helper.is_button_available(button_labels.attack);
			if (player_state.action != actions.attack && attack_available) {
	
				let calculateDamage = (old_hp, new_hp, whos_damage) => {
					if (new_hp && new_hp < old_hp) {
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
				player_state.fight.enemy_damage = calculateDamage(player_state.hp, next_action_state.player_hp, player_state.fight.enemy_damage);
				//console.log(['Enemy damage', player_state.fight.enemy_damage]);
				player_state.fight.damage_to_enemy = calculateDamage(player_state.fight.enemy_hp, next_action_state.fight.enemy_hp, player_state.fight.damage_to_enemy);
				//console.log(['Player damage', player_state.fight.damage_to_enemy]);
	
				if (next_action_state.fight.enemy_hp) {
					player_state.fight.enemy_hp = next_action_state.fight.enemy_hp;
				}
	
				if (next_action_state.fight.enemy_max_hp) {
					player_state.fight.enemy_max_hp = next_action_state.fight.enemy_max_hp;
				}
	
				updateHealth();
				publish(event_names.change_action, {"action": actions.fight});
				return;
			}
	
			if (player_state.confirm_exit && button_helper.is_button_available(button_labels.interrupt)) {
				updateHealth();
				publish(event_names.change_action, {"action": actions.interrupt});
				return;
			}
		};
	
		let reactToActionChange = () => {
			switch (player_state.action) {
				case actions.progress:
					publish(event_names.progress);
					break;
				case actions.rest:
					publish(event_names.rest);
					break;
				case actions.fight:
					publish(event_names.fight);
					break;
				case actions.fishing:
					publish(event_names.fishing);
					break;
				case actions.interrupt:
					publish(event_names.interrupt);
					break;
				case actions.use_potion:
					publish(event_names.use_potion);
					break;
			}
		}
		let determineNextAction = function(next_action_state) {
			//console.log("Going to do next action");
			if (next_action_state.lesser_action_available) {
				publish(event_names.lesser_action);
				return;
	
				let able_to_skin = button_helper.is_lesser_button_available(button_labels.skin);
				if (able_to_skin) {
					publish(event_names.skin);
					return;
				}
	
				let able_to_search = button_helper.is_lesser_button_available(button_labels.search);
				if (able_to_search) {
					publish(event_names.skin);
					return;
				}
			} else {
				let oldAction = player_state.action;
				determineCurrentAction(next_action_state);
				let newAction = player_state.action;
				if (oldAction == newAction) {
					reactToActionChange();
				}
			}
		}
	
		//console.log("Main logic end");
	
		let timeoutDelay = 3000;
		const delay = ms => new Promise(res => setTimeout(res, ms));
	
		let analyseLastMessages = () => {
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
			let message_state = {
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
										message_state.fishing.grab_fish = true;
									}
	
									if (message_state.next_hp_is_player && row.data.startsWith("HP:")) {
										let text = row.data.split(' ')[1];
										let now = parseInt(text.split('/')[0]);
										let max = parseInt(text.split('/')[1]);
										message_state.player_hp = now;
										message_state.player_max_hp = max;
										message_state.next_hp_is_player = false;
									}
	
									if (message_state.next_hp_is_enemy && row.data.includes(": ")) {
										let text = row.data.split(': ')[1];
										text = text.split(' ')[0];
										let now = parseInt(text.split('/')[0]);
										let max = parseInt(text.split('/')[1]);
										message_state.fight.enemy_hp = now;
										message_state.fight.enemy_max_hp = max;
										message_state.next_hp_is_enemy = false;
									}
	
									if (message_state.fishing.bait_next) {
										let text = row.data.split(': ')[1];
										message_state.fishing.bait_left = parseInt(text);
										message_state.fishing.bait_next = false;
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
											message_state.lesser_action_available = true;
										}
									}
								}
	
								if (row.tagName == 'IMG') {
									switch (row.alt) {
										case "💚":
											message_state.next_hp_is_player = true;
											break;
										case "❤":
											message_state.next_hp_is_enemy = true;
											break;
										case "🐛":
											message_state.fishing.bait_next = true
											message_state.fishing.is = true;
											break;
									}
								}
							});
						});
					}
				});
	
			}
			//console.log("State prepared");
			return message_state;
		}
	
		const mainLoop = async () => {
			//console.log(["Running", player_state.running]);
			if (!player_state.running) {
				return;
			}
	
			let last_message_result = analyseLastMessages();
	
			//console.log(last_message_result);
			if (last_message_result.hasOwnProperty('error')) {
				//console.log(last_message_result.error);
				return;
			}
	
			determineNextAction(last_message_result);
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
	})}})(that.context, that.fapply, that.console);
	//# sourceURL=chrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/userscript.html?name=New%2520Userscript.user.js&id=b7324349-f0a4-4934-9955-a340f5154394
	})((()=>{const k="__u__19641920.98650013",r=this[k];delete this[k];return r;})())