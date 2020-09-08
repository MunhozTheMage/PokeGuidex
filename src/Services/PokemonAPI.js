//================================================================================
// External:                                                                      
//================================================================================
import superagent from 'superagent';

//================================================================================
// Components:                                                                    
//================================================================================
import MF from '../Utils/MathFunctions.js';

//================================================================================
// Classes:
//================================================================================
import Pokemon from '../Classes/Pokemon.js';

//================================================================================
// Consts and Vars:                                                               
//================================================================================
const base_url = 'https://pokeapi.co/api/v2/';
const base_url_v1 = 'https://pokeapi.glitch.me/v1/';
const pokemon_url = 'pokemon/';
const species_url = 'pokemon-species/';
const last_pokemon = 894;

//================================================================================
// Functions:                                                                     
//================================================================================

// Gets a Pokémon based on name or national ID. Takes four arguments: the
// first one is the name/id of the pokemon, the second is a callback that
// will be executed before everything else, the third is a callback that
// will be executed in case of success, and the last is also a callback
// function that will be executed in case of error(s).
export function getPokemon(pokemonId, onStart = () => {}, onSuccess = () => {}, onError = () => {}) {
    onStart();

    let pokemon, species;

    Promise.all([
        superagent.get(base_url + pokemon_url + pokemonId), 
        superagent.get(base_url + species_url + pokemonId)
    ])
    .then(([pokemonRes, speciesRes]) => {
        pokemon = pokemonRes.body;
        species = speciesRes.body;
        return superagent.get(species.evolution_chain.url);
    })
    .then((res) => {
        let evolutionLine = res.body;
        onSuccess(new Pokemon({pokemon, species, evolutionLine}));
    })
    .catch((err) => {
        onError(err.statusCode);
    });
}

// Gets a list with the names of all Pokemons
export function getNamesList(onSuccess = () => {}, onError = () => {}) {
    superagent.get(base_url + `pokemon?limit=${last_pokemon}`).then((res) => {
        onSuccess(res.body.results);
    }).catch((err) => {
        onError(err);
    });
}

// Tries to find a Pokemon based on user input, returns the Pokemon
// id if found, else returns 0, a number that will give an error on
// the getPokemon function.
export function findPokemon(list, nameOrNum) {
    //Defines if it is a number or name
    let isNumber = !isNaN(nameOrNum);

    if(isNumber) {
        let num = +nameOrNum;

        // Checks if it's a valid Pokémon id
        if(num <= last_pokemon) {
            return num;
        }

        // It wasn't valid, return 0 will give an error in the search
        return 0;
    }

    // If isn't a number this will happen
    let name = '' + nameOrNum;
    let resultId = 0;

    // Loop through the list of names to see if the names are exactly
    // equal, if they are, change the value of resultId from 0 to the
    // Pokemon's id
    list.forEach((v, id) => {
        if(name === v.name) {
            resultId = id + 1;
        }
    });
    
    // If the Pokemon was found, then return the resultId
    if(resultId !== 0) {
        return resultId;
    }

    let endInLength = (
        name.length < 4 ?
        name.length : 4
    )

    // Each time this loop repeats, it looks the names array to see if
    // they have a value that at least includes the value given by the
    // user. Each time nothing was found, the last character of the
    // string is removed and the process is repeated, but when the
    // string has less than 4 characters the loop won't repeat.
    for(var i = name.length; i >= endInLength; i--) {
        let findName = name.slice(0, i);
        list.forEach((v, id) => {
            if(v.name.includes(findName) && resultId === 0) {
                resultId = id + 1;
            } 
        });
        if(resultId !== 0) {
            break;
        }
    }

    // At this point, if no valid result was found, 0 will be returned.
    // But if the loop actually found something, this value will be 
    // returned instead.
    return resultId;
}