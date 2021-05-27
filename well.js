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

console.log(["Tm running", location.search]);
if (/\bsel=-182985865\b/.test (location.search) ) {
	const actions = {
		"progress": 1,
		"fight": 2,
		"rest": 3,
		'fishing_hub': 4,
		'interrupt': 5,
		'use_potion': 6,
		'last_lesser_action': 7,
		'stand_in_hub': 8,
		'grab_fish': 9,
		'open_chest': 10,
		'flee': 11,
	}

	let player_state = {
		"running": false,
		'debug': false,
		'input_enabled': false,
		"hp": -1,
		"max_hp": -1,
		'traumas': 0,
		"getHealthPercentage": function() {
			return this.hp / this.max_hp;
		},
		"action": actions.progress,
		"fishing": {
			"bait_left": 0,
			'grab_fish': false
		},
		"fight": {
			'secondary_action_available': true,
			'using_potion': false,
			'can_use_skills': true,
			'potions': null,
			'max_potions': null,
			'enemy_max_hp': null,
			'enemy_hp': null,
			'enemy_damage': null,
			'damage_to_enemy': null,
			'unable_to_determine_potion': false,
			'enemy_enrages': 0,
			'initial_enemy_damage': null,
			'pvp_peace_available': false,
			'is_pvp': false,
			'can_use_potions': true,
			'flee': false,
		},
		'rest': {
			'already_cooked': false,
		},
		"confirm_exit": false,
		'lesser_button_labels': [],
		'settings': {
			'available_potions': {

			},
			'get_available_potions': function () {
				let potions = {};
				for (index in this.available_potions) {
					let i = this.available_potions[index];
					if (i.enabled) {
						potions[index] = i;
					}
				}
				return potions;
			}
		}
	}

	let log = (value) => {
		if (player_state.debug) {
			console.log(value);
		}
	}

	// eventMachine START
	log("Event machine start");
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
	log("Event machine end");
	// eventMachine END

	let constants = {
		"WELL_HREF": "https://vk.com/welldungeon",

	}

	const texts = {
		"GRAB_FISH": "Поплавок полностью ушел под воду!",
	}

	// buttons START
	log("Buttons start");

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
		"skin": "Освеживать",
		"search": "Обыскать",
		"interrupt": "Прервать",
		'back': 'Назад',
		'fight': {
			'flee': 'Сбежать',
		},
		"fishing": {
			"start_fishing": "Закинуть удочку",
			"stop_fishing": "Прервать рыбалку",
			"grab_fish": "Подсечь",
		},
		'potions': {
			'weak': 'Слабое зелье',
			'simple': 'Простое зелье',
			'common': 'Обычное зелье',
			'big': 'Большое зелье',
			'strong': 'Сильное зелье',
			'wonderful': 'Чудесное зелье',
		},
		'utility': {
			'open_chest': 'Открыть',
			"continue": "Продолжить",
			"flee": "Освободиться",
			'pvp_peace': 'Перемирие',
			'confirm_flee': 'Подтвердить',
			'leave': 'Покинуть',
		},
		'secondary': {
			'accuracy': 'Яркий свет',
		}
	}

	let button_helper = {
		"is_button_available": (text) => {
			let found = false;
			document.querySelectorAll('button[type="text"]').forEach((btn) => {
				btn.childNodes.forEach((chd) => {
					if (chd.tagName == "SPAN" && chd.innerText == text) {
						found = true;
						return;
					}
				})
			})
			return found;
		}
	}

	let press_button = (text) => {
		/*if (!button_helper.is_button_available(text)) {
			console.log(["Unable to find", text]);
			return;
		}*/
		console.log(["Going to press", text]);
		let found = false;
		document.querySelectorAll('button[type="text"]').forEach((btn) => {
			btn.childNodes.forEach((chd) => {
				if (chd.tagName == "SPAN" && chd.innerText == text) {
					log("Pressed");
					if (player_state.input_enabled) {
						chd.click();
					}
					found = true;
					return;
				}
			})
		});
		if (!found) {
			console.log(["Unable to find", text]);
		}
	}

	let lesser_button = {
		'press_last': () => {
			let buttons = document.querySelectorAll('span[class=MessageKeyboard__label]');
			let button = buttons[buttons.length - 1];
			console.log(["Going to press last lesser"]);
			if (player_state.input_enabled) {
				button.click();
			}
		},
		'press_by_name': (text) => {
			let buttons = document.querySelectorAll('button[data-type=text]');
			let button = null;
			buttons.forEach((btn) => {
				if (button) {
					return;
				}
				if (btn.innerText && btn.innerText == text) {
					button = btn;
				}
			});
			console.log("Going to press lesser " + text);
			if (player_state.input_enabled) {
				button.click();
			}
		}
	}

	log("Buttons end");
	// buttons END	

	let fight_helper = {
		'how_many_hits_to_die': function () {
			let enemy_damage = this.get_complete_enemy_damage();
			return player_state.hp && enemy_damage
			? player_state.hp / enemy_damage
			: 9999;
		},
		'how_many_hits_to_kill': () => {
			return player_state.fight.damage_to_enemy && player_state.fight.enemy_hp
			? (player_state.fight.enemy_hp / (player_state.fight.damage_to_enemy *0.9))
			: 9999;
		},
		'get_complete_enemy_damage': function () {
			let enrage_modifier =  1 + player_state.fight.enemy_enrages *0.2;
			let enemy_damage = player_state.fight.initial_enemy_damage ?? (player_state.fight.enemy_damage ?? null);
			return enemy_damage ? enemy_damage *1.1 *enrage_modifier : null;
		}
	}
	
	let base_subscriber = (action, callback) => {
		return () => {
			subscribe(event_names.change_action, function(arg) {
				if (arg.action == action) {
					callback(arg);
				}
			});
		};
	}

	let subscribers = {
		'rest': base_subscriber(actions.rest, function(arg) {
			if (!player_state.rest.already_cooked && button_helper.is_button_available(button_labels.prepare_meal)) {
				press_button(button_labels.prepare_meal);
				player_state.rest.already_cooked = true;
			}
		}),
		'use_potion': base_subscriber(actions.use_potion, function(arg) {
			if (player_state.fight.using_potion) {

				let available_potions = [];
				let allowed_potions = player_state.settings.get_available_potions();

				for (potion_type in allowed_potions) {
					let potion_label = button_labels.potions[potion_type];
					if (player_state.lesser_button_labels.includes(potion_label)) {
						available_potions.push(potion_type);
					}
				}

				let enemy_hit = fight_helper.get_complete_enemy_damage();
				let need_hp = enemy_hit * 2 - player_state.hp;
				need_hp = need_hp * (1 + (0.5 * (player_state.fight.max_potions - player_state.fight.potions)));

				let super_final_potion_type = null;
				if (enemy_hit) {
					let potion_heal = null;
					for (potion_type in available_potions) {
						let potion = available_potions[potion_type];
						let value = allowed_potions[potion].value;
						if (value > need_hp) {
							if (!potion_heal || potion_heal > value) {
								potion_heal = value;
								super_final_potion_type = potion_type;
							}
						}
					}

				}

				if (super_final_potion_type == null){
					let final_potion_type = null;
					let potion_heal = null;
					for (potion_type in available_potions) {
						let value = allowed_potions[available_potions[potion_type]].value;
						if (!potion_heal) {
							potion_heal = value;
							final_potion_type = potion_type;
						}
						if (value > potion_heal) {
							potion_heal = value;
							final_potion_type = potion_type;
						}
					}
					super_final_potion_type = final_potion_type;
				}

				if (super_final_potion_type) {
					lesser_button.press_by_name(button_labels.potions[available_potions[super_final_potion_type]]);
				} else {
					player_state.fight.unable_to_determine_potion = true;
				}

				player_state.fight.using_potion = false;
				player_state.fight.secondary_action_available = false;
			}
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
			log('Guessing progressing...');
			if (button_helper.is_button_available(button_labels.utility.continue)) {
				press_button(button_labels.utility.continue);
			}
			if (button_helper.is_button_available(button_labels.utility.flee)) {
				press_button(button_labels.utility.flee);
			}
			if (button_helper.is_button_available(button_labels.utility.leave)) {
				//press_button(button_labels.utility.leave);
			}
		}),
		'open_chest': base_subscriber(actions.open_chest, function(arg) {
			press_button(button_labels.utility.open_chest);
		}),
		'stand_in_hub': base_subscriber(actions.stand_in_hub, function(arg) {
			if (player_state.getHealthPercentage() < 1 - player_state.traumas*0.05 - 0.02) {
				if (button_helper.is_button_available(button_labels.rest)) {
					press_button(button_labels.rest);
					//publish(event_names.change_action, {"action": actions.rest});
				}
				return;
			}

			press_button(button_labels.progress);
		}),
		'fight': base_subscriber(actions.fight, function(arg) {
			let how_many_hits_to_die = fight_helper.how_many_hits_to_die();
			let how_many_hits_to_kill = fight_helper.how_many_hits_to_kill();
			let heal_available = button_helper.is_button_available(button_labels.heal_skill);
			if (player_state.fight.secondary_action_available) {
				if (!heal_available && how_many_hits_to_kill != 9999 && how_many_hits_to_kill > how_many_hits_to_die && player_state.fight.potions && player_state.fight.potions < 1) {
					press_button(button_labels.fight.flee);
					player_state.fight.secondary_action_available = false;
					player_state.fight.flee = true;
					return;
				}

				if (how_many_hits_to_die < 2 && (!heal_available || !player_state.fight.can_use_skills)) {
					if (player_state.fight.initial_enemy_damage) {
						player_state.fight.can_use_potions = true;	
					}

					if ((how_many_hits_to_die <= 1 || how_many_hits_to_kill > 1) && player_state.fight.can_use_potions) {
						if (!player_state.fight.unable_to_determine_potion) {
							press_button(button_labels.use_potion);
						}
						player_state.fight.using_potion = true;
						return;
					}				
				}

				if (button_helper.is_button_available(button_labels.secondary.accuracy)) {					
					press_button(button_labels.secondary.accuracy);
					player_state.fight.secondary_action_available = false;
				}
			}			

			if (player_state.fight.is_pvp) {
				if (player_state.fight.pvp_peace_available) {
					if (button_helper.is_button_available(button_labels.utility.pvp_peace)) {	
						press_button(button_labels.utility.pvp_peace);
						return;
					}
				} else {
					player_state.fight.is_pvp = false;
				}
			} else {
				let attack = button_labels.attack;
				if (player_state.fight.can_use_skills) {
					if ((how_many_hits_to_die < 5 || how_many_hits_to_kill == 1) && heal_available) {
						attack = button_labels.heal_skill;
					} else if (button_helper.is_button_available(button_labels.split_skill)) {
						attack = button_labels.split_skill;
					} else if (button_helper.is_button_available(button_labels.shadow_skill)) {
						attack = button_labels.shadow_skill;
					}
				}
				press_button(attack);			
				player_state.fight.secondary_action_available = true;
			}
		}),
		'last_lesser_action': base_subscriber(actions.last_lesser_action, function(arg) {
			lesser_button.press_last();
		}),
		'grab_fish': base_subscriber(actions.grab_fish, function(arg) {
			if (player_state.fishing.grab_fish) {
				press_button(button_labels.fishing.grab_fish);
				return;
			}
		}),
		'flee': base_subscriber(actions.grab_fish, function(arg) {
			if (player_state.fight.flee) {
				press_button(button_labels.utility.confirm_flee);
			}
		}),
		'after_action_change': () => {
			subscribe(event_names.after_action_change, (arg) => {
				if (arg.action) {
					player_state.action = arg.action;
				}
			});
		},
		'unset_unable_to_determine_potion': () => {
			subscribe(event_names.after_action_change, (arg) => {
				if (arg.action && arg.action == actions.fight) {
					player_state.fight.unable_to_determine_potion = false;
				}
			});
		},
		'disable_cook_limit': () => {
			subscribe(event_names.before_action_change, (arg) => {
				if (arg.action && arg.action == actions.stand_in_hub) {
					player_state.rest.already_cooked = false;
				}
			});
		},		
		'reset_damage_params': () => {
			subscribe(event_names.before_action_change, (arg) => {
				if (arg.action && player_state.action == actions.fight && arg.action != actions.fight && arg.action != actions.use_potion) {
					player_state.fight.enemy_damage = null;
					player_state.fight.damage_to_enemy = null;
					player_state.fight.initial_enemy_damage = null;
					player_state.fight.is_pvp = false;
					player_state.fight.pvp_peace_available = false;
					player_state.fight.enemy_hp = null;
					player_state.fight.enemy_max_hp = null;
					player_state.fight.initial_enemy_damage = null;
					player_state.fight.enemy_enrages = 0;
					player_state.fight.can_use_potions = true;
					player_state.fight.can_use_skills = true;
					player_state.fight.flee = false;
				}
			});
		},
		'reset_enrage': () => {
			subscribe(event_names.after_action_change, (arg) => {
				if (arg.action && arg.action == actions.fight) {
					player_state.fight.enemy_enrages = false;
				}
			});
		},
	};

	let subscribe_all = () => {
		for(sub in subscribers) {
			subscribers[sub]();
		}
	};
	subscribe_all();

	let determine_next_action = (next_action_state) => {

		if (next_action_state.lesser_action_available) {
			if (player_state.fight.using_potion) {
				return actions.use_potion;
			}
			return actions.last_lesser_action;
		}

		if (player_state.fight.flee && button_helper.is_button_available(button_labels.fight.flee)) {
			return actions.flee;
		}

		if (button_helper.is_button_available(button_labels.utility.open_chest)) {
			return actions.open_chest;
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

		return actions.progress;
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

		let calculate_damage = (old_hp, new_hp, whos_damage, min) => {
			if (old_hp && new_hp) {
				if (new_hp < old_hp) {
					let diff = old_hp - new_hp;
					if (!whos_damage) {
						return diff;
					} else {
						if (min) {
							return whos_damage > diff
								? diff
								: whos_damage;
						} else {
							return whos_damage > diff
								? whos_damage
								: diff;
						}						
					}
				} else {
					return whos_damage;
				}
			}
			return whos_damage;
		}
		let update_enemy_damage = () => {
			player_state.fight.enemy_damage = calculate_damage(
				player_state.hp,
				next_action_state.player_hp,
				player_state.fight.enemy_damage
			);
			if (player_state.fight.enemy_damage) {
				player_state.fight.initial_enemy_damage = null;
			}
			log(['Enemy damage', player_state.fight.enemy_damage]);
		}
		let update_damage_to_enemy = () => {
			player_state.fight.damage_to_enemy = calculate_damage(
				player_state.fight.enemy_hp,
				next_action_state.fight.enemy_hp,
				player_state.fight.damage_to_enemy,
				true
			);
			log(['Player damage', player_state.fight.damage_to_enemy]);
		}

		let update_unable_to_use_skills = () => {
			if (player_state.action != actions.use_potion) {				
				player_state.fight.can_use_skills = next_action_state.fight.can_use_skills;
			}
		}

		let update_grab_fish = () => {
			player_state.fishing.grab_fish = next_action_state.fishing.grab_fish;
		}

		let update_lesser_buttons = () => {
			player_state.lesser_button_labels = next_action_state.lesser_buttons;
		}

		let update_potions_count = () => {
			player_state.fight.potions = next_action_state.fight.potions_left;
			if (!player_state.fight.potions) {
				player_state.fight.max_potions = player_state.fight.potions;
			}
		};

		let update_enemy_enrages = () => {
			if (next_action_state.fight.enemy_enrages) {
				player_state.fight.enemy_enrages++;
			}
		};

		let update_traumas = () => {
			if (next_action_state.traumas) {
				player_state.traumas = next_action_state.traumas;
			}
		}

		let update_initial_enemy_damage = () => {
			if (next_action_state.fight.initial_enemy_damage) {
				player_state.fight.initial_enemy_damage = next_action_state.fight.initial_enemy_damage;
			}
		}

		let update_pvp_state = () => {
			if (next_action_state.fight.pvp_peace_available) {
				player_state.fight.pvp_peace_available = next_action_state.fight.pvp_peace_available;
				player_state.fight.is_pvp = true;
			}
		}

		let update_can_use_potions = () => {
			if (next_action_state.fight.can_use_potions == false) {
				player_state.fight.can_use_potions = next_action_state.fight.can_use_potions;
				player_state.fight.potions = 0;
			}
		}

		update_initial_enemy_damage();
		update_enemy_damage();
		update_damage_to_enemy();
		update_health();
		update_enemy_health();
		update_grab_fish();
		update_lesser_buttons();
		update_potions_count();
		update_unable_to_use_skills();
		update_enemy_enrages();
		update_traumas();
		update_pvp_state();
		update_can_use_potions();
	};

	let doNextAction = function(next_action_state) {
		log("Going to do next action");
		let next_action = determine_next_action(next_action_state);
		if (!next_action) {
			return;
		}

		update_current_state(next_action_state);
		let new_action = player_state.action != next_action;
		if (new_action) {
			publish(event_names.before_action_change, {"action": next_action});
		}
		publish(event_names.change_action, {"action": next_action});
		if (new_action) {
			publish(event_names.after_action_change, {"action": next_action});
		}
	}

	log("Main logic end");

	let timeoutDelay = 3000;
	const delay = ms => new Promise(res => setTimeout(res, ms));

	let collectNextStateSource = () => {
		//log("Analyse last messages");
		var messages = document.querySelectorAll('div[class="im-mess-stack _im_mess_stack "]');
		//log(messages);
		let last_messages = [];
		let index = messages.length - 1;
		//log(index);
		while (index >= 0) {
			let message = messages[index];
			let link = message.getElementsByClassName('im_grid')[0];
			//log(["link", link, link.tagName == "A", link.href == constants.WELL_HREF]);
			if (link.tagName == "A") {
				if (link.href == constants.WELL_HREF) {
					last_messages.push(message);
					//log("Valid link");
				} else {
					break;
				}
			}
			index--;
		}

		//log(last_messages);
		if (last_messages.length == 0) {
			return {"error": "No messages"};
		}
		//log("Got some messages");
		let next_state_source = {
			"player_hp": null,
			"player_max_hp": null,
			"lesser_action_available": false,
			'lesser_buttons': [],
			'traumas': null,
			"fishing": {
				"bait_left": 0,
				"grab_fish": false,
				"is": false,
			},
			"fight": {
				'enemy_max_hp': null,
				'enemy_hp': null,
				'potions_left': null,
				'can_use_skills': true,
				'enemy_enrages': false,
				'initial_enemy_damage': null,
				'pvp_peace_available': false,
				'can_use_potions': true,
			},
		}
		let states = {
			"next_hp_is_player": false,
			"next_hp_is_enemy": false,
			"next_is_traumas": false,
			'next_is_initial_enemy_damage': null,
			'skip_next_lesser': false,
			'fishing': {
				"bait_next": false,
			}
		}
		let can_collect_potions_count = player_state.action == actions.use_potion;
		for (last_message of last_messages) {
			//log(['lm',last_message]);
			let list = last_message.getElementsByClassName('ui_clean_list im-mess-stack--mess _im_stack_messages')[0];
			//log(['list', list]);
			list.childNodes.forEach((item) => {
				//log(['item',item]);
				if(item.childNodes.length != 0) {
					let content = item.getElementsByClassName('im-mess--text wall_module _im_log_body');
					//log(['content', content]);
					content.forEach((contentItem) => {
						//log(['cI', contentItem]);
						contentItem.childNodes.forEach((row) => {
							//log(["row", row]);
							if (row.nodeName == "#text") {
								if (states.next_is_initial_enemy_damage) {									
									let number = parseInt(row.data);
									if (number) {
										next_state_source.fight.initial_enemy_damage = number;
									}
									states.next_is_initial_enemy_damage = false;
								}

								if (states.next_is_traumas) {									
									let text = row.data.split(': ')[1];
									let number = parseInt(text);
									if (number) {
										next_state_source.traumas = number;
									}
									states.next_is_traumas = false;
								}

								if (can_collect_potions_count) {
									let text = row.data.split(' ')[5];
									if (text) {
										let potions_count = parseInt(text.split('/')[0]);
										next_state_source.fight.potions_left = potions_count;
										can_collect_potions_count = false;
									}
								}

								if (player_state.fishing.bait_left > 0 && row.data == texts.GRAB_FISH) {
									next_state_source.fishing.grab_fish = true;
								}

								if (states.next_hp_is_player) {
									let text = row.data.split(': ')[1];
									let now = parseInt(text.split('/')[0]);
									let max = parseInt(text.split('/')[1]);
									next_state_source.player_hp = now;
									next_state_source.player_max_hp = max;
									states.next_hp_is_player = false;
								}

								if (states.next_hp_is_enemy && row.data.includes(": ")) {
									let text = row.data.split(': ')[1];
									text = text.split(' ')[0];
									let now = parseInt(text.split('/')[0]);
									let max = parseInt(text.split('/')[1]);
									next_state_source.fight.enemy_hp = now;
									next_state_source.fight.enemy_max_hp = max;
									states.next_hp_is_enemy = false;
								}

								if (states.fishing.bait_next) {
									let text = row.data.split(': ')[1];
									next_state_source.fishing.bait_left = parseInt(text);
									states.fishing.bait_next = false;
								}
							}

							if (row.tagName == 'DIV') {
								if (row.className.startsWith('_im_msg_media')) {
									let lesser = row.getElementsByClassName('MessageKeyboard');
									//log(lesser);
									const validLesser = (lesser) => {
										if (lesser.length <= 0) {
											return false;
										}
										let button = lesser[0].getElementsByClassName('MessageKeyboard__button MessageKeyboard__button--open-link Button Button--size-s Button--secondary _im_mess_btn');
										return button.length < 1 || !button[0].href;

									};
									let lesser_action_exists = validLesser(lesser);
									//log(['lae', lesser_action_exists]);
									if (lesser_action_exists) {
										let lesser_buttons = [];
										lesser.forEach((i) => {
											let rows = i.getElementsByClassName('MessageKeyboard__row');
											rows.forEach((lesser_row) => {
												let cells = lesser_row.getElementsByClassName('MessageKeyboard__cell');
												cells.forEach((cell) => {
													cell.childNodes.forEach((childNode) => {
														if (childNode.innerText) {
															lesser_buttons.push(childNode.innerText);
														}
													})
												})
											});
										});
										next_state_source.lesser_buttons = lesser_buttons;
										if (lesser_buttons.length > 0) {
											if (!states.skip_next_lesser) {
												next_state_source.lesser_action_available = true;
											} 
											states.skip_next_lesser = false;
										}
									}
								}
							}

							// 🗣 - без скилов, 🍄 - не поднимать

							if (row.tagName == 'IMG') {
								switch (row.alt) {
									case "💚":
										states.next_hp_is_player = true;
										break;
									case "❤":
										states.next_hp_is_enemy = true;
										break;
									case "🐛":
										states.fishing.bait_next = true
										next_state_source.fishing.is = true;
										break;
									case '🗣':
										next_state_source.fight.can_use_skills = false;
										break;
									case '🖤':
										states.next_is_traumas = true;
										break;
									case '💢':
										next_state_source.fight.enemy_enrages = true;
										break;
									case '⚔':
										states.next_is_initial_enemy_damage = true;
										break;
									case '🌿':
										states.skip_next_lesser = true;
										break;
									case '🍄':
										states.skip_next_lesser = true;
										break;
									case '👥':
										next_state_source.fight.pvp_peace_available = true;
										break;
									case '⛔':
										next_state_source.fight.can_use_potions = false;
										break;
								}
							}
						});
					});
				}
			});

		}
		log("State prepared");
		return next_state_source;
	}

	const mainLoop = async () => {
		log(["Running", player_state.running]);
		if (!player_state.running) {
			return;
		}

		let next_state_source = collectNextStateSource();

		log(next_state_source);
		if (next_state_source.hasOwnProperty('error')) {
			log(next_state_source.error);
			return;
		}

		doNextAction(next_state_source);
	};

	let ui = {
		"createUi": function (main_player_state) {
			let ids = {
                'container': 'myContainer',
				'stop_button': 'stop_button',
				'debug': 'debug',
				'no_buttons': 'no_buttons',
				'settings': {
					'potions': 'potion_enabler',
				},
				'section': {
					'potions': 'potions'
				},
				'element': {
					'potion_handler': 'potion_handler',
				}
			};

			let create_canvas = () => {
				let zNode = document.createElement ('div');
                zNode.id = ids.container;
				document.body.appendChild (zNode);
				return zNode;
			}

			let create_stop_button = (canvas, main_player_state) => {
				let button = document.createElement('button');
				button.id = ids.stop_button;
				button.innerText = 'Start/Stop';

				let set_running_state_text = () => {
					button.innerText = main_player_state.running ? "Stop" : "Start";
					button.setAttribute('state', main_player_state.running ? "off" : "on");
				}
				set_running_state_text();
				let button_click_action = (e) => {
					main_player_state.running = !main_player_state.running;
					set_running_state_text();
				}
				button.addEventListener("click", button_click_action, false);

				canvas.appendChild(button);
			}

			let create_checkbox = (id, canvas, label_text, default_state, callback) => {
				var div = document.createElement('div');
				// creating checkbox element
				var checkbox = document.createElement('input');

				checkbox.addEventListener('change', callback);

				// Assigning the attributes
				// to created checkbox
				checkbox.type = "checkbox";
				checkbox.id = id;
				checkbox.checked = default_state;

				// creating label for checkbox
				var label = document.createElement('label');

				// assigning attributes for
				// the created label tag
				label.htmlFor = id;

				// appending the created text to
				// the created label tag
				label.appendChild(document.createTextNode(label_text));

				// appending the checkbox
				// and label to div
				div.appendChild(checkbox);
				div.appendChild(label);
				canvas.appendChild(div);
			}

			let create_debug_checkbox = (canvas, main_player_state) => {
				create_checkbox(ids.debug, canvas, 'Debug', false, (event) => {
					if (event.currentTarget.checked) {
						main_player_state.debug = true;
					} else {
						main_player_state.debug = false;
					}
				});
			}

			let create_options = (canvas) => {
				let create_potions_enabler = (options_canvas) => {
					create_checkbox(ids.settings.potions, options_canvas, 'Зелья', false, (event) => {
						let section = document.querySelectorAll('div#' + ids.section.potions)[0];
						if (section) {
							if (event.currentTarget.checked) {
								section.style.display = 'block';
							} else {
								section.style.display = 'none';
							}
						}
					});
				};

				create_potions_enabler(canvas);
			}

			let create_no_buttons_checkbox = (canvas, main_player_state) => {
				create_checkbox(ids.no_buttons, canvas, 'Disable auto-press', true, (event) => {
					if (event.currentTarget.checked) {
						main_player_state.input_enabled = false;
					} else {
						main_player_state.input_enabled = true;
					}
				});
			}

			let create_potions_section = (canvas, main_player_state) => {				
				let potion_section = document.createElement ('div');
				potion_section.id = ids.section.potions;
				potion_section.style.display = 'none';
				canvas.appendChild(potion_section);

				let create_potion = (canvas, potion_id, main_player_state) => {
					var div = document.createElement('div');
					div.id = ids.element.potion_handler;

					// creating label for checkbox
					var label = document.createElement('label');
					label.htmlFor = potion_id;
					label.innerText = button_labels.potions[potion_id];

					var textarea = document.createElement('textarea');
					textarea.id = potion_id;
					textarea.rows = 1;
					textarea.cols = 3;

					// creating checkbox element
					var checkbox = document.createElement('input');
					checkbox.type = "checkbox";
					checkbox.id = potion_id;
					checkbox.checked = false;
					checkbox.addEventListener('change', (event) => {
						let potion_stat = {
							'enabled': false,
							'value': parseInt(textarea.value),
						}
						if (event.currentTarget.checked) {
							potion_stat.enabled = true;
						}
						main_player_state.settings.available_potions[potion_id] = potion_stat;
					});
					div.appendChild(label);
					div.appendChild(checkbox);
					div.appendChild(textarea);
					canvas.appendChild(div);
				}

				create_potion(potion_section, 'weak', main_player_state);
				create_potion(potion_section, 'simple', main_player_state);
				create_potion(potion_section, 'common', main_player_state);
				create_potion(potion_section, 'big', main_player_state);
				create_potion(potion_section, 'strong', main_player_state);
				create_potion(potion_section, 'wonderful', main_player_state);
			}

			let canvas = create_canvas();
			create_stop_button(canvas, main_player_state);
			create_debug_checkbox(canvas, main_player_state);
			create_no_buttons_checkbox(canvas, main_player_state);
			create_options(canvas);
			create_potions_section(canvas, main_player_state);
			//--- Style our newly added elements using CSS.
			GM_addStyle ( `
			#myContainer {
				position:               fixed;
				top:                    15%;
				left:                   75%;
				font-size:              20px;
				z-index:                1100;
			}
			#myContainer > * {
				display: block;
			}
			#stop_button {
				cursor:                 pointer;
			}
			#stop_button[state='off'] {
				background-color: red;
			}
			#stop_button[state='on'] {
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
	log("Infinity ended");
}