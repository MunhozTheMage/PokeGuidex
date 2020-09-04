import './Pokedex.css';

//================================================================================
// External:                                                                      
//================================================================================
import React, { useState, useEffect } from 'react';

//================================================================================
// Components:                                                                    
//================================================================================
import DropdownInput from '../Components/DropdownInput.js';
import ErrorScreen from '../Components/ErrorScreen.js';
import InfoBox from '../Components/InfoBox.js';
import LoadingScreen from '../Components/LoadingScreen.js';
import NavArrowButton from '../Components/NavArrowButton.js';
import SearchBar from '../Components/SearchBar.js';

//================================================================================
// Services:                                                                      
//================================================================================
import { getPokemon, getNamesList, findPokemon } from '../Services/PokemonAPI.js';

//================================================================================
// Utils:                                                                         
//================================================================================
import { capitalizeString, replaceAll, capitalizeAllWords } from '../Utils/StringFunctions.js';

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
    const [pokemonNamesList, set_pokemonNamesList] = useState([]);
    const [pokemonInfo, set_pokemonInfo] = useState(defaultPokemonState);
    const [gameSelectValue, set_gameSelectValue] = useState('');
    const [evolutionNav, set_evolutionNav] = useState(0);
    const [isLoading, set_isLoading] = useState(true);
    const [hasError, set_hasError] = useState({minor: false, major: false});

    useEffect(() => {
        getNamesList(
        (list) => {
            set_pokemonNamesList(list);
            console.log(list);
            set_isLoading(false);
        }, 
        (err) => {
            set_isLoading(false);
            console.log(err);
            set_hasError({minor: false, major: true});
        })
    }, [])

    // Called to change the current Pokémon page
    function searchPokemon(searchValue) {
        let searchId = findPokemon(
            pokemonNamesList, 
            replaceAll(searchValue.toLowerCase(), ' ', '-')
        );
        getPokemon(
        searchId, 
        () => {
            // Removes any error status current active and enables
            // the loading screen
            set_isLoading(true);
            set_hasError({...hasError, minor: false});
        }, 
        (data) => {
            // Clear the current Pokémon object and reset the evolution
            // pointer to the first evolution
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
                    shape: capitalizeAllWords(
                        replaceAll(data._info.species.shape.name, '-', ' ')
                    ),
                    generation: capitalizeAllWords(
                        replaceAll(data._info.species.generation.name, '-', ' ')
                    ),
                    habitat: (
                    !(data._info.species.habitat === null) ? 
                    capitalizeAllWords(replaceAll(data._info.species.habitat.name, '-', ' ')) 
                    : null
                    ),
                }
            });

            // Finish loading
            set_isLoading(false);
        },
        (err) => {
            // Finish loading and enables the error screen
            set_isLoading(false);
            set_hasError({...hasError, minor: true});
            console.log(err);
        });
    }

    // Renders the Pokemon Basic Info on the page
    function pokemonBasicInfo(condition) {
        // Renders a box containing the Pokémon image and type symbol(s)
        function basic_pokemonImageBox() {
            return (
                <div className='imageBox'>
                    <img src={pokemonInfo.image} alt={pokemonInfo.name}/>
                    <div className={pokemonInfo.types.length > 1 ? 'twoTypes' : 'oneType'}>
                    {
                        pokemonInfo.types.map((v, i) => {
                            // For each type of this Pokémon, render one Type Symbol image
                            return (
                                <img src={v.img} alt={v.name} key={`${v.name}_${i}`}></img>
                            )
                        })
                    }
                    </div>
                </div>
            );
        }

        // Renders a box containing all flavor texts for this Pokémon
        function basic_flavorTextArea() {
            return (
                <div className='flavorTextArea'>
                    <div className='flavorTexts'>
                        {
                        // Renders all the flavor texts for the current Pokémon
                        pokemonInfo.entries.map((v, i) => <p key={`flavor_text_${i}`}>{v}</p>)
                        }
                    </div>
                </div>
            )
        }

        return ( 
            condition ?
                <div className='pokemonBasic'>    
                    <h1 className='pokemonName'>{pokemonInfo.name}</h1>
                    { basic_pokemonImageBox() }
                    { basic_flavorTextArea() }
                </div>
            : null
        );
    }

    // Renders an area full of InfoBox containing various informations
    function pokemonDetails(condition) {
        // Renders a InfoBox component
        function details_renderInfoBox(condition = true, title = '', className = '', content) {
            return (
                condition ?
                <InfoBox
                title={title}
                className={className}
                content={content}
                />
                : null
            )
        }

        // Renders an InfoBox containing a table of stats
        function details_baseStats() {
            function content() {
                return (
                    <div className='stats'>
                        <table className='statsTable'>
                            <tbody>
                                {pokemonInfo.stats.map((v) => {
                                    // For each stat create a new table row
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
                );
            }

            return details_renderInfoBox(
                true,
                'Base Stats:',
                '',
                content()
            )
        }

        // Renders an InfoBox containing a table of misc information
        function details_about() {
            function content() {
                return (
                    <div className='pokemonDetails'>
                        <table className='detailsTable'>
                            <tbody>
                                    <tr>
                                        <th className='statName'>
                                        {pokemonInfo.types.length === 1 ? "Type:" : "Types:"}
                                        </th>
                                        <th className='statVal'>{pokemonInfo.types.length === 1 ? 
                                        capitalizeString(pokemonInfo.types[0].name) : 
                                        capitalizeString(pokemonInfo.types[0].name) 
                                        + ' & ' + 
                                        capitalizeString(pokemonInfo.types[1].name)}
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
                                    <tr> 
                                        <th className='statName'>Habitat:</th>
                                        <th className='statVal'>{pokemonInfo.minor.habitat}</th>
                                    </tr>
                            </tbody>
                        </table>
                    </div> 
                )
            }

            return details_renderInfoBox(
                true,
                `About This Pokemon:`,
                '',
                content()
            );
        }

        // Renders an InfoBox containing the Pokémon that evolves to this one,
        // if there isn't any, it won't render anythig
        function details_evolvesFrom() {
            function content() {
                return (
                    <div className='preEvolution'>
                        <h4>
                        {
                        `${pokemonInfo.preEvolution.name}`+
                        ` (${pokemonInfo.preEvolution.id})`
                        }
                        </h4>
                        <div className='imageBox'>
                            <img 
                            src={pokemonInfo.preEvolution.img} 
                            alt={pokemonInfo.preEvolution.name}
                            />
                        </div>
                        <button 
                        onClick={() => {searchPokemon(pokemonInfo.preEvolution.id.toString())}}
                        >View More</button>
                    </div>
                );
            }

            return details_renderInfoBox(
                pokemonInfo.hasPreEvolution,
                'Evolves From:',
                !pokemonInfo.hasEvolution ? 'doubleSpace' : '',
                pokemonInfo.hasPreEvolution ? content() : null
            )
        }

        // Renders an InfoBox containing the Pokémons that evolves from this one,
        // if there isn't any, it won't show anything, if there is more than one,
        // it will render NavArrowButtons to change the current content to another
        // Pokémon that also evolves from this one.
        function details_evolvesTo() {
            function content() {
                return (
                    <div className='evolution'>
                        {pokemonInfo.evolution.length > 1 ? 
                            <NavArrowButton
                            modifier={-1}
                            currentValue={evolutionNav}
                            set={set_evolutionNav}
                            limitValue={0}
                            />
                        : null}

                        <div className='evolutionContent'>
                            <h4>{
                            `${capitalizeString(pokemonInfo.evolution[evolutionNav].name)}`+
                            ` (${pokemonInfo.evolution[evolutionNav].id})`
                            }</h4>
                            <div className='imageBox'>
                                <img 
                                src={pokemonInfo.evolution[evolutionNav].img} 
                                alt={pokemonInfo.evolution[evolutionNav].name}/>
                            </div>
                            <button 
                            onClick={() => {
                                searchPokemon(pokemonInfo.evolution[evolutionNav].id.toString())
                            }}
                            >View More</button>
                        </div>
                                
                        {pokemonInfo.evolution.length > 1 ? 
                            <NavArrowButton
                            currentValue={evolutionNav}
                            set={set_evolutionNav}
                            limitValue={pokemonInfo.evolution.length - 1}
                            />
                        : null}
                    </div>
                );
            }

            return details_renderInfoBox(
                pokemonInfo.hasEvolution,
                'Evolves To:',
                !pokemonInfo.hasPreEvolution ? 'doubleSpace' : '',
                pokemonInfo.hasEvolution ? content() : null
            );
        }

        // Renders an InfoBox containing a guide on how to evolve this Pokémon,
        // if there isn't any evolution, it won't show anything, if there is more
        // than one it will render NavArrowButtons to change the current content
        // to another Pokémon that also evolves from this one.
        function details_evolutionGuide() {
            function content() {
                return (
                    <div className='evolutionGuide'>
                        {pokemonInfo.evolution.length > 1 ? 
                            <NavArrowButton
                            modifier={-1}
                            currentValue={evolutionNav}
                            set={set_evolutionNav}
                            limitValue={0}
                            />
                        : null}

                        <div className='evolutionGuideContent'>
                            <h4>{
                            `${capitalizeAllWords(pokemonInfo.name.split(' ').slice(0, -1).join(' '))}`+ 
                            `  >  ${capitalizeAllWords(pokemonInfo.evolution[evolutionNav].name)}`
                            }</h4>
                            <div className='evolutionMethods'>
                                {
                                    pokemonInfo.evolution_method[
                                        pokemonInfo.evolution[evolutionNav].name.toLowerCase()
                                    ].map((v, i) => {
                                        return <p key={`evo_guide_${i}`}>{v}</p>
                                    })
                                }
                            </div>
                        </div>
                            
                        {pokemonInfo.evolution.length > 1 ? 
                            <NavArrowButton
                            currentValue={evolutionNav}
                            set={set_evolutionNav}
                            limitValue={pokemonInfo.evolution.length - 1}
                            />
                        : null}
                    </div>
                );
            }

            return details_renderInfoBox(
                pokemonInfo.hasEvolution,
                'How to Evolve:',
                'doubleSpace',
                pokemonInfo.hasEvolution ? content() : null
            );
        }

        return (
            condition ? 
            <div className='pokemonOtherInfo'>
                { details_baseStats() }
                { details_about() }
                { details_evolvesFrom() }
                { details_evolvesTo() }
                { details_evolutionGuide() }
            </div>
            : null
        );
    }

    function pokemonMoveList(condition) {

        function move_navigation() {
            return (
                <div className='moveNavigation'>
                    <DropdownInput 
                        label='Game'
                        keyPrefix='game_id'
                        setValue={set_gameSelectValue}
                        value={gameSelectValue}
                        choices={Object.keys(pokemonInfo.moves)}
                    />
                </div>
            );
        }

        function move_moveList() {

            function move_list_levelUpCategory() {
                function move_list_level_moveBox(move, index) {
                    return (
                        <div 
                        className='moveBox' 
                        key={
                        `${replaceAll(move.name.toLowerCase(), ' ', '_')}_${index}`
                        }
                        >
                            {move.level > 0 ?
                                <div className='levelBox'>
                                    <p>{move.level}</p>
                                </div>
                            : null}
                            <p>{move.name}</p>
                        </div>
                    );
                }

                return Object.keys(pokemonInfo.moves[gameSelectValue])
                .map((v, i) => {
                    if(v === "Level Up") {
                        return (
                            <div 
                            className='moveCategory' 
                            key={`${replaceAll(v.toLowerCase(), ' ', '-')}_${i}`}
                            >
                                <h2>{v}</h2>
                                {
                                    // Renders a levelMoveBox for all the moves in the Lavel Up category
                                    // for the game that is currently selected in the dropdown field
                                    pokemonInfo.moves[gameSelectValue][v].map((v, i) => {
                                        return (
                                            move_list_level_moveBox(v, i)
                                        )
                                    })
                                }
                            </div>
                        )
                    }
                });
            }

            function move_list_otherCategories() {
                function move_list_other_moveBox(move, index) {
                    return (
                        <div 
                        className='moveBox' 
                        key={
                        `${replaceAll(move.name.toLowerCase(), ' ', '_')}_${index}`
                        }
                        >
                            <p>{move.name}</p>
                        </div>
                    );
                }

                return Object.keys(pokemonInfo.moves[gameSelectValue])
                .map((v, i) => {
                    if(v !== "Level Up") {
                        return (
                            <div 
                            className='moveCategory' 
                            key={`${replaceAll(v.toLowerCase(), ' ', '-')}_${i}`}
                            >
                                <h2>{v}</h2>
                                {
                                    pokemonInfo.moves[gameSelectValue][v].map((v, i) => {
                                        return (
                                            // Renders a moveBox for all the moves in all categories (except
                                            // the Level Up category) for the game that is currently
                                            move_list_other_moveBox(v, i)
                                        )
                                    })
                                }
                            </div>
                        )
                    }
                });
            }

            return (
                <div className='moves'>
                { move_list_levelUpCategory() }
                { move_list_otherCategories() }
                </div>
            );
        }

        return (
            condition ?
            <div className='moveList'>
                { move_navigation() }
                {gameSelectValue !== '' && !!pokemonInfo.moves[gameSelectValue] ?
                    move_moveList()
                : null }
            </div>
            : null
        )
    }

    function pokemonSearchBar(conditionToShow = true, conditionToWork = true) {
        return (
            conditionToShow ?
            <div className='searchBarArea'>
                <SearchBar 
                label='Type the Pokemon name or number'
                buttonText="Search"
                onclick={conditionToWork ? searchPokemon : () => {}}
                />
            </div>
            : null
        );
    }

    function loading() {
        return (
        <LoadingScreen 
        evalFunction={() => {return isLoading}}
        />
        )
    }

    function error() {
        let errMessage = "Oops, couldn't find that Pokémon."

        if(hasError.major) {
            errMessage = "Fatal error, too bad :P"
        }

        return (
            <ErrorScreen
            evalFunction={() => {return hasError.minor || hasError.major}}
            message={errMessage}
            />
        )
    }

    // Pokedex main renderer
    return (
        <div className="Pokedex">
            { pokemonBasicInfo(pokemonInfo.name !== '' && !isLoading && !hasError.minor && !hasError.major) }
            { pokemonDetails(pokemonInfo.name !== '' && !isLoading && !hasError.minor && !hasError.major) }
            { pokemonMoveList(pokemonInfo.name !== '' && !isLoading && !hasError.minor && !hasError.major) }
            { pokemonSearchBar(true, !hasError.major) }
            { loading() }
            { error() }
        </div>
    );
}