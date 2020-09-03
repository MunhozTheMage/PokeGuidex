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
const pokemon_url = 'pokemon/';
const species_url = 'pokemon-species/';
const evolution_url = 'evolution-chain/';
const last_pokemon = 807;

//================================================================================
// Functions:                                                                     
//================================================================================
export function getPokemon(pokemonId, onStart = () => {}, onSuccess = () => {}, onError = () => {}) {
    onStart();

    let pokemon, species;

    Promise.all([superagent.get(base_url + pokemon_url + pokemonId), superagent.get(base_url + species_url + pokemonId)])
    .then(([pokemonRes, speciesRes]) => {
        pokemon = pokemonRes.body;
        species = speciesRes.body;
        console.log(pokemon, species);
        return superagent.get(species.evolution_chain.url);
    })
    .then((res) => {
        let evolutionLine = res.body;
        console.log({evolutionLine});
        onSuccess(new Pokemon({pokemon, species, evolutionLine}));
    })
    .catch((err) => {
        onError(err.statusCode);
    });
}

/*export function getRandomPokémon(onSuccess) {
    let rndm = MF.getRandomNumberBetweenRangeInclusive(1, last_pokemon);
    getPokemon(rndm, onSuccess);
}*/