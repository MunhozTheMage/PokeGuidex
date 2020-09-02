//================================================================================
// Utils:
//================================================================================
import {capitalizeString, replaceAll, capitalizeAllWords, useAorAn} from '../Utils/StringFunctions';

export default class Pokemon {
    constructor(reqObj) {
        this._info = reqObj;
        this.typeImages = {
            normal: 'https://cdn.bulbagarden.net/upload/thumb/9/95/Normal_icon_SwSh.png/64px-Normal_icon_SwSh.png',
            fighting: 'https://cdn.bulbagarden.net/upload/thumb/3/3b/Fighting_icon_SwSh.png/64px-Fighting_icon_SwSh.png',
            flying: 'https://cdn.bulbagarden.net/upload/thumb/b/b5/Flying_icon_SwSh.png/64px-Flying_icon_SwSh.png',
            poison: 'https://cdn.bulbagarden.net/upload/thumb/8/8d/Poison_icon_SwSh.png/64px-Poison_icon_SwSh.png',
            ground: 'https://cdn.bulbagarden.net/upload/thumb/2/27/Ground_icon_SwSh.png/64px-Ground_icon_SwSh.png',
            rock: 'https://cdn.bulbagarden.net/upload/thumb/1/11/Rock_icon_SwSh.png/64px-Rock_icon_SwSh.png',
            bug: 'https://cdn.bulbagarden.net/upload/thumb/9/9c/Bug_icon_SwSh.png/64px-Bug_icon_SwSh.png',
            ghost: 'https://cdn.bulbagarden.net/upload/thumb/0/01/Ghost_icon_SwSh.png/64px-Ghost_icon_SwSh.png',
            steel: 'https://cdn.bulbagarden.net/upload/thumb/0/09/Steel_icon_SwSh.png/64px-Steel_icon_SwSh.png',
            fire: 'https://cdn.bulbagarden.net/upload/thumb/a/ab/Fire_icon_SwSh.png/64px-Fire_icon_SwSh.png',
            water: 'https://cdn.bulbagarden.net/upload/thumb/8/80/Water_icon_SwSh.png/64px-Water_icon_SwSh.png',
            grass: 'https://cdn.bulbagarden.net/upload/thumb/a/a8/Grass_icon_SwSh.png/64px-Grass_icon_SwSh.png',
            electric: 'https://cdn.bulbagarden.net/upload/thumb/7/7b/Electric_icon_SwSh.png/64px-Electric_icon_SwSh.png',
            psychic: 'https://cdn.bulbagarden.net/upload/thumb/7/73/Psychic_icon_SwSh.png/64px-Psychic_icon_SwSh.png',
            ice: 'https://cdn.bulbagarden.net/upload/thumb/1/15/Ice_icon_SwSh.png/64px-Ice_icon_SwSh.png',
            dragon: 'https://cdn.bulbagarden.net/upload/thumb/7/70/Dragon_icon_SwSh.png/64px-Dragon_icon_SwSh.png',
            dark: 'https://cdn.bulbagarden.net/upload/thumb/d/d5/Dark_icon_SwSh.png/64px-Dark_icon_SwSh.png',
            fairy: 'https://cdn.bulbagarden.net/upload/thumb/c/c6/Fairy_icon_SwSh.png/64px-Fairy_icon_SwSh.png'
        }
    }

    getDisplayName(language = 'en') {
        console.log(this)
        let name = capitalizeAllWords(replaceAll(this._info.species.name, '-', ' '));

        if(language !== 'en') {
            for(let i = 0; i < this._info.species.names.length; i++) {
                if(this._info.species.names[i].language.name.includes(language)) {
                    name = this._info.species.names[i].name;
                    break;
                }
            }
        }

        return capitalizeString(`${name} (${this._info.pokemon.id})`);
    }

    getImage(id = this._info.pokemon.id) {
        let stringId = id.toString();
        while(stringId.length < 3) {
            stringId = '0' + stringId;
        }
        return `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${stringId}.png`;
    }

    getTypes() {
        return this._info.pokemon.types.map((v) => {
            return { name: v.type.name, img: this.typeImages[v.type.name] };
        })
    }

    getStats() {
        let stats = this._info.pokemon.stats;
        let result = [{}];

        stats.forEach((v) => {
            let obj = {};
            obj.name = '';
            obj.value = v.base_stat;

            switch(v.stat.name) {
                case 'hp':
                    obj.name = 'HP';
                    break;

                case 'attack':
                    obj.name = 'ATK';
                    break;

                case 'defense':
                    obj.name = 'DEF';
                    break;

                case 'special-attack':
                    obj.name = 'S.ATK';
                    break;

                case 'special-defense':
                    obj.name = 'S.DEF';
                    break;

                case 'speed':
                    obj.name = 'SPD';
                    break;
            }

            if(v.stat.name !== 'hp') {
                result.push(obj);
            } else {
                result[0] = obj;
            }
        });

        return result;
    }

    getAllPokedexEntries(language = 'en') {
        let entries = [];

        for(let i = 0; i < this._info.species.flavor_text_entries.length; i++) {
            if(this._info.species.flavor_text_entries[i].language.name.includes(language)) {
                
                entries.push(replaceAll(replaceAll(this._info.species.flavor_text_entries[i].flavor_text, '\f', ' '), '\n', ' ') 
                + ` (${capitalizeAllWords(replaceAll(this._info.species.flavor_text_entries[i].version.name, '-', ' '))})`);
            }
        }

        if(entries.length === 0) return this.getAllPokedexEntries('en');

        return entries;   
    }

    // Objective: Loop through the moves and if they are adquired by leveling up and haven't
    // already been added to the list, add them to the list. Loop through the list again, now
    // adding the other types and making sure not to repeat them.

    // Structure: Container Object => Game Group Object => Learning Method Array => Move Object {level, name}.
    getMoves() {

        let sorted = {};
        let moveNames = {};

        this._info.pokemon.moves.forEach((move) => {
            
            move.version_group_details.forEach((group) => {

                let gameGroupName = capitalizeAllWords(replaceAll(group.version_group.name, '-', ' '));
                let name = capitalizeAllWords(replaceAll(move.move.name, '-', ' '));
                moveNames[gameGroupName] = moveNames[gameGroupName] || [];

                if(group.move_learn_method.name === 'level-up' && !moveNames[gameGroupName].includes(name)) {
                    
                    let method = capitalizeAllWords(replaceAll(group.move_learn_method.name, '-', ' '));
                    let level = group.level_learned_at;

                    if(level < 1) {
                        level = 1;
                    }

                    sorted[gameGroupName] = sorted[gameGroupName] || {};
                    sorted[gameGroupName][method] = sorted[gameGroupName][method] || [];
                    sorted[gameGroupName][method].push({name, level});
                    moveNames[gameGroupName].push(name);
                }
            });
        });

        this._info.pokemon.moves.forEach((move) => {
            
            move.version_group_details.forEach((group) => {

                let gameGroupName = capitalizeAllWords(replaceAll(group.version_group.name, '-', ' '));
                let name = capitalizeAllWords(replaceAll(move.move.name, '-', ' '));
                moveNames[gameGroupName] = moveNames[gameGroupName] || [];

                if(!moveNames[gameGroupName].includes(name)) {
                    
                    let method = capitalizeAllWords(replaceAll(group.move_learn_method.name, '-', ' '));

                    sorted[gameGroupName] = sorted[gameGroupName] || {};
                    sorted[gameGroupName][method] = sorted[gameGroupName][method] || [];
                    sorted[gameGroupName][method].push({name});
                    moveNames[gameGroupName].push(name);
                }

            });
        });

        Object.keys(sorted).forEach((group) => {
            if(!sorted[group]["Level Up"]) return;

            sorted[group]["Level Up"].sort((a, b) => {
                return a.level - b.level;
            })
        });

        return sorted;
    }

    getPreEvolution() {
        let url_base = "https://pokeapi.co/api/v2/pokemon-species/"

        if(this.hasPreEvolution()) {
            let name = this._info.species.evolves_from_species.name;
            let id = +this._info.species.evolves_from_species.url.split(url_base)[1].split('/')[0];
            let img = this.getImage(id);

            return {name, id, img};
        }

        return {name: '', id: 0, img: ''};
    }

    getEvolutions() {
        let thisPokemon;
        
        function loop(root, name) {

            if(name === root.species.name) {
                thisPokemon = root;
                return;
            } else {
                root.evolves_to.forEach((v) => {
                    loop(v, name);
                });
            }
        }

        loop(this._info.evolutionLine.chain, this._info.species.name);

        if(thisPokemon.evolves_to.length === 0) {
            return [];
        }

        return thisPokemon.evolves_to.map((v) => {
            let url_base = "https://pokeapi.co/api/v2/pokemon-species/";

            let name = v.species.name;
            let id = +v.species.url.split(url_base)[1].split('/')[0];
            let img = this.getImage(id);

            return {name, id, img};
        });
    }

    getEvolutionTriggers() {
        let methodByName = {};

        function loop(root) {
            methodByName[root.species.name] = [];

            if(root.evolution_details.length > 0) {
                Object.keys(root.evolution_details[0]).forEach((v) => {
                    let p = root.evolution_details[0][v];
                    let text = '';

                    function pName(path = p.name) {
                        return capitalizeAllWords(replaceAll(path, '-', ' '));
                    }

                    if(!(p === null || p === false || p === '')) {
                        switch(v) {
                            case 'gender': 
                            let gender = p === 1 ? 'female' : 'male';
                            text = `Must be ${gender}.`;
                            break;

                            case 'held_item':
                            text = `Must be holding ${pName()}.`;
                            break;

                            case 'item':
                            text = `Must use ${pName()}.`;
                            break;

                            case 'known_move':
                            text = `Must know the move: ${pName()}.`;
                            break;

                            case 'known_move_type':
                            text = `Must know a ${pName()}-Type move.`;
                            break;

                            case 'location':
                            text = `Must be at ${pName()}.`;
                            break;

                            case 'min_affection':
                            text = `Must have at least ${p} affection points.`;
                            break;

                            case 'min_beauty':
                            text = `Must have at least ${p} beauty points.`;
                            break;

                            case 'min_happiness':
                            text = `Must have at least ${p} happiness points.`;
                            break;

                            case 'min_level':
                            text = `Must be at least level ${p}.`;
                            break;

                            case 'needs_overworld_rain':
                            text = `Must be raining.`;
                            break;

                            case 'party_species':
                            text = `Must have ${useAorAn(pName())} ${pName()} in your party.`;
                            break;

                            case 'party_type':
                            text = `Must have ${useAorAn(pName())} ${pName()}-Type Pokemon in your party.`;
                            break;

                            case 'relative_physical_stats':
                            switch(p) {
                                case -1:
                                text = `Defense must be higher than attack.`;
                                break;

                                case 0:
                                text = `Attack and defense must be equal.`;
                                break;

                                case 1:
                                text = `Attack must be higher than defense.`;
                                break;
                            }
                            break;

                            case 'time_of_day':
                            text = `Must be during the ${p}.`;
                            break;

                            case 'trade_species':
                            text = `Must be traded by ${useAorAn(pName())} ${pName()}.`;
                            break;

                            case 'turn_upside_down':
                            text = `Must turn the device upside down.`;
                            break;

                            case 'trigger':
                            let trigger = '';

                            switch (p.name) {
                                case 'level-up':
                                trigger = 'leveling up the pokemon';
                                break;

                                case 'use-item':
                                trigger = 'using the specified item on the pokemon';
                                break;

                                case 'trade':
                                trigger = 'trading this pokemon with another trainer'
                                break;

                                default:
                                trigger = pName();
                                break;
                            }

                            text = `The evolution is triggered by ${trigger}.`;
                            break;

                        }
                        methodByName[root.species.name].push(text);
                    }
                });
            }

            root.evolves_to.forEach((v) => {
                loop(v);
            });
        }

        loop(this._info.evolutionLine.chain, this._info.pokemon.name);

        return methodByName;
    }

    hasPreEvolution() {
        return !!this._info.species.evolves_from_species;
    }

    hasEvolution() {
        return this.getEvolutions().length > 0;
    }


}