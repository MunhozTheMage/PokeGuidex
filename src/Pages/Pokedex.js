import './Pokedex.css';

//================================================================================
// External:                                                                      
//================================================================================
import React, { useState } from 'react';

//================================================================================
// Components:                                                                    
//================================================================================
import SearchBar from '../Components/SearchBar.js';
import DropdownInput from '../Components/DropdownInput.js';
import infoBox from '../Components/InfoBox.js';

//================================================================================
// Services:                                                                      
//================================================================================
import { getPokemon } from '../Services/PokemonAPI.js';

//================================================================================
// Utils:                                                                         
//================================================================================
import { capitalizeString, replaceAll, capitalizeAllWords } from '../Utils/StringFunctions.js';
import InfoBox from '../Components/InfoBox.js';

export default function Pokedex() {
    const defaultPokemonState = { 
        name: '', 
        image: '', 
        entries: [], 
        moves: {}, 
        hasPreEvolution: false, 
        hasEvolution: false, 
        evolution: [],
        types: [],
        evolution_method: {},
        stats: [],
        minor: {}
    }
    const [pokemonInfo, set_pokemonInfo] = useState(defaultPokemonState);
    const [gameSelectValue, set_gameSelectValue] = useState('');
    const [evolutionNav, set_evolutionNav] = useState(0);
    const [isLoading, set_isLoading] = useState(false);
    const [hasError, set_hasError] = useState(false);

    function searchPokemon(searchValue) {
        getPokemon(
        replaceAll(searchValue.toLowerCase(), ' ', '-'), 
        () => {
            set_isLoading(true);
            set_hasError(false);
        }, 
        (data) => {
            set_pokemonInfo(defaultPokemonState);
            set_evolutionNav(0);

            set_pokemonInfo({ 
                name: data.getDisplayName(), 
                image: data.getImage(), 
                entries: data.getAllPokedexEntries(), 
                moves: data.getMoves(), 
                hasPreEvolution: data.hasPreEvolution(), 
                hasEvolution: data.hasEvolution(), 
                preEvolution: data.getPreEvolution(), 
                evolution: data.getEvolutions(), 
                types: data.getTypes(), 
                evolution_method: data.getEvolutionTriggers(),
                stats: data.getStats(),
                minor: {
                    height: (data._info.pokemon.height / 10) + ' m',
                    weight: (data._info.pokemon.weight / 10) + ' kg',
                    shape: capitalizeAllWords(replaceAll(data._info.species.shape.name, '-', ' ')),
                    generation: capitalizeAllWords(replaceAll(data._info.species.generation.name, '-', ' ')),
                    habitat: !(data._info.species.habitat === null) ? capitalizeAllWords(replaceAll(data._info.species.habitat.name, '-', ' ')) : null,
                }
            });

            set_isLoading(false);
        },
        (err) => {
            set_isLoading(false);
            set_hasError(true);
            console.log(err);
        });
    }

    return (
        <div className="Pokedex">
                {
                    // Pokemon Basic Info:
                }
                { pokemonInfo.name !== '' && !isLoading && !hasError ?
                <div className='pokemonBasic'>    
                    <h1 className='pokemonName'>{pokemonInfo.name}</h1>
                    <div className='imageBox'>
                        <img src={pokemonInfo.image} alt={pokemonInfo.name}/>
                        <div className={pokemonInfo.types.length > 1 ? 'twoTypes' : 'oneType'}>
                        {
                            pokemonInfo.types.map((v, i) => {
                                return (
                                    <img src={v.img} alt={v.name} key={`${v.name}_${i}`}></img>
                                )
                            })
                        }
                        </div>
                    </div>
                    <div className='flavorTextArea'>
                        <div className='flavorTexts'>
                            {pokemonInfo.entries.map((v, i) => <p key={`flavor_text_${i}`}>{v}</p>)}
                        </div>
                    </div>
                </div>
                : null}

                {
                    // Pokemon Other Info:
                }

                {pokemonInfo.name !== '' && !isLoading && !hasError ? 
                    <div className='pokemonOtherInfo'>

                        <InfoBox 
                        title='Base Stats:'
                        content={
                            <div className='stats'>
                                <table className='statsTable'>
                                <tbody>
                                {pokemonInfo.stats.map((v) => {
                                    return (
                                        <tr key={v.name + '_stat'}>
                                            <th className='statName'>{v.name}</th>
                                            <th className='statVal'>{v.value}</th>
                                        </tr>
                                    ) 
                                })}
                                </tbody>
                                </table>
                            </div> 
                        }
                        />

                        <InfoBox 
                        title='Pokemon Info:'
                        content={
                            <div className='pokemonDetails'>
                                <table className='detailsTable'>
                                <tbody>
                                    <tr>
                                        <th className='statName'>{pokemonInfo.types.length === 1 ? "Type:" : "Types:"}</th>
                                        <th className='statVal'>{pokemonInfo.types.length === 1 ? 
                                        capitalizeString(pokemonInfo.types[0].name) : 
                                        capitalizeString(pokemonInfo.types[0].name) + ' & ' + capitalizeString(pokemonInfo.types[1].name)}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className='statName'>Height:</th>
                                        <th className='statVal'>{pokemonInfo.minor.height}</th>
                                    </tr>
                                    <tr>
                                        <th className='statName'>Weight:</th>
                                        <th className='statVal'>{pokemonInfo.minor.weight}</th>
                                    </tr>
                                    <tr>
                                        <th className='statName'>Shape:</th>
                                        <th className='statVal'>{pokemonInfo.minor.shape}</th>
                                    </tr>
                                    <tr>
                                        <th className='statName'>Generation:</th>
                                        <th className='statVal'>{pokemonInfo.minor.generation}</th>
                                    </tr>
                                    {pokemonInfo.minor.habita === null ?
                                    <tr> 
                                        <th className='statName'>Habitat:</th>
                                        <th className='statVal'>{pokemonInfo.minor.habitat}</th>
                                    </tr>
                                    : null}
                                </tbody>
                                </table>
                            </div> 
                        }
                        />

                        {pokemonInfo.hasPreEvolution ? 
                        <InfoBox 
                        title='Evolves From:'
                        content={(
                            <div className='preEvolution'>
                                <h4>{`${capitalizeString(pokemonInfo.preEvolution.name)} (${pokemonInfo.preEvolution.id})`}</h4>
                                <div className='imageBox'>
                                    <img src={pokemonInfo.preEvolution.img} alt={pokemonInfo.preEvolution.name}/>
                                </div>
                                <button onClick={() => {searchPokemon(pokemonInfo.preEvolution.id.toString())}}>View More</button>
                            </div>
                        )}
                        className={!pokemonInfo.hasEvolution ? 'doubleSpace' : ''}
                        />
                        : null}

                        {pokemonInfo.hasEvolution ? 
                        <InfoBox 
                        title='Evolves To:'
                        content={(
                            <div className='evolution'>
                                {pokemonInfo.evolution.length > 1 ? 
                                <button 
                                className={evolutionNav > 0 ? 'navButton navButtonActive' : 'navButton navButtonInactive'}
                                onClick={evolutionNav > 0 ?
                                () => {
                                    set_evolutionNav(evolutionNav - 1);
                                }
                                : () => {}}
                                >{'<'}</button> 
                                : null}

                                <div className='evolutionContent'>
                                    <h4>{`${capitalizeString(pokemonInfo.evolution[evolutionNav].name)} (${pokemonInfo.evolution[evolutionNav].id})`}</h4>
                                    <div className='imageBox'>
                                        <img src={pokemonInfo.evolution[evolutionNav].img} alt={pokemonInfo.evolution[evolutionNav].name}/>
                                    </div>
                                    <button onClick={() => {searchPokemon(pokemonInfo.evolution[evolutionNav].id.toString())}}>View More</button>
                                </div>
                                
                                {pokemonInfo.evolution.length > 1 ? 
                                <button 
                                className={evolutionNav < pokemonInfo.evolution.length - 1 ? 'navButton navButtonActive' : 'navButton navButtonInactive'}
                                onClick={evolutionNav < pokemonInfo.evolution.length - 1 ?
                                () => {
                                    set_evolutionNav(evolutionNav + 1);
                                }
                                : () => {}}
                                >{'>'}</button> 
                                : null}
                            </div>
                        )}
                        className={!pokemonInfo.hasPreEvolution ? 'doubleSpace' : ''}
                        />
                        : null}

                        {pokemonInfo.hasEvolution ? 
                        <InfoBox 
                        title='How To Evolve:'
                        content={(
                            <div className='evolutionGuide'>
                                {pokemonInfo.evolution.length > 1 ? 
                                <button 
                                className={evolutionNav > 0 ? 'navButton navButtonActive' : 'navButton navButtonInactive'}
                                onClick={evolutionNav > 0 ?
                                () => {
                                    set_evolutionNav(evolutionNav - 1);
                                }
                                : () => {}}
                                >{'<'}</button> 
                                : null}

                                <div className='evolutionGuideContent'>
                                    <h4>{
                                    `${capitalizeAllWords(pokemonInfo.name.split(' ').slice(0, -1).join(' '))} > 
                                    ${capitalizeAllWords(pokemonInfo.evolution[evolutionNav].name)}`
                                    }</h4>
                                    <div className='evolutionMethods'>
                                        {
                                            pokemonInfo.evolution_method[pokemonInfo.evolution[evolutionNav].name.toLowerCase()].map((v, i) => {
                                                return <p key={`evo_guide_${i}`}>{v}</p>
                                            })
                                        }
                                    </div>
                                </div>
                                
                                {pokemonInfo.evolution.length > 1 ? 
                                <button 
                                className={evolutionNav < pokemonInfo.evolution.length - 1 ? 'navButton navButtonActive' : 'navButton navButtonInactive'}
                                onClick={evolutionNav < pokemonInfo.evolution.length - 1 ?
                                () => {
                                    set_evolutionNav(evolutionNav + 1);
                                }
                                : () => {}}
                                >{'>'}</button> 
                                : null}
                            </div>
                        )}
                        className='doubleSpace'
                        />
                        : null}
                    </div>
                : null}

                {
                    //Pokemon Move List:
                }

                { pokemonInfo.name !== '' && !isLoading && !hasError ?
                <div className='moveList'>
                    <div className='moveNavigation'>
                        <DropdownInput 
                            label='Game'
                            keyPrefix='game_id'
                            setValue={set_gameSelectValue}
                            value={gameSelectValue}
                            choices={Object.keys(pokemonInfo.moves)}
                        />
                    </div>
                    { gameSelectValue !== '' && !!pokemonInfo.moves[gameSelectValue] ?
                    <div className='moves'>
                    {
                    Object.keys(pokemonInfo.moves[gameSelectValue]).map((v, i) => {
                        if(v === "Level Up") {
                            return (
                                <div className='moveCategory' key={`${replaceAll(v.toLowerCase(), ' ', '-')}_${i}`}>
                                    <h2>{v}</h2>
                                    {
                                        pokemonInfo.moves[gameSelectValue][v].map((v, i) => {
                                            return (
                                                <div className='moveBox' key={`${replaceAll(v.name.toLowerCase(), ' ', '_')}_${i}`}>
                                                    {v.level > 0 ?
                                                    <div className='levelBox'>
                                                        <p>{v.level}</p>
                                                    </div>
                                                    : null}
                                                    <p>{v.name}</p>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            )
                        }
                    })
                }

                {
                    Object.keys(pokemonInfo.moves[gameSelectValue]).map((v, i) => {
                        if(v !== "Level Up") {
                            return (
                                <div className='moveCategory' key={`${replaceAll(v.toLowerCase(), ' ', '-')}_${i}`}>
                                    <h2>{v}</h2>
                                    {
                                        pokemonInfo.moves[gameSelectValue][v].map((v, i) => {
                                            return (
                                                <div className='moveBox' key={`${replaceAll(v.name.toLowerCase(), ' ', '_')}_${i}`}>
                                                    <p>{v.name}</p>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            )
                        }
                    })
                }
                    </div>
                    : null }
                </div>
                : null}
            

            {
                // Pokedex Search Bar:
            }

            { isLoading ?
            <div className='loading'>
                <h1>Loading...</h1>
            </div>
            : null}

            { hasError ?
            <div className='error'>
                <h1>Oops, couldn't find that Pokemon.</h1>
            </div>
            : null}

            <div className='searchBarArea'>
                <SearchBar 
                label='Type the Pokemon name or number'
                buttonText="Search"
                onclick={searchPokemon}
                />
            </div>

        </div>
    );
}