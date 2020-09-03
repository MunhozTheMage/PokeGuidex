//================================================================================
// Utils:
//================================================================================
import {capitalizeString, replaceAll, capitalizeAllWords, useAorAn} from '../Utils/StringFunctions';

export default class Pokemon {
    constructor(reqObj) {
        this._info = reqObj;
        this.typeImages = {
            normal: 'https://i.ibb.co/PF7wYJf/normal.png',
            fighting: 'https://i.ibb.co/H7btCrQ/fighting.png',
            flying: 'https://i.ibb.co/Bzv4DXk/flying.png',
            poison: 'https://i.ibb.co/Rggf4h3/poison.png',
            ground: 'https://i.ibb.co/FV5vh7D/ground.png',
            rock: 'https://i.ibb.co/68rn0M7/rock.png',
            bug: 'https://i.ibb.co/0hTtRns/bug.png', 
            ghost: 'https://i.ibb.co/K0tnCXb/ghost.png',
            steel: 'https://i.ibb.co/6B849X5/steel.png',
            fire: 'https://i.ibb.co/pdFQyQs/fire.png',
            water: 'https://i.ibb.co/nCfgkps/water.png',
            grass: 'https://i.ibb.co/DbPbyYy/grass.png',
            electric: 'https://i.ibb.co/FnmvSFR/electric.png',
            psychic: 'https://i.ibb.co/Mg3PzvN/psychic.png',
            ice: 'https://i.ibb.co/Tk60FRM/ice.png',
            dragon: 'https://i.ibb.co/tJjkNFG/dragon.png',
            dark: 'https://i.ibb.co/0JT9CqP/dark.png',
            fairy: 'https://i.ibb.co/gStBvMm/fairy.png',
        }
    }

    getDisplayName(language = 'en') {
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
        return `https://cdn.traction.one/pokedex/pokemon/${id}.png`;
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