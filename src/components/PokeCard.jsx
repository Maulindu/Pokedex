import { cache, useEffect, useState, useMemo } from "react"
import { getFullPokedexNumber, getPokedexNumber, pokemonTypeColors } from '../utils'
import { SideNav } from "./SideNav"
import TypeCard from "./TypeCard"
import Modal from "./Modal"

export function PokeCard(props) {

    const { selectedPokemon } = props
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [skill, setSkill] = useState(null)
    const [loadingSkill, setLoadingSkill] = useState(false)

    const {name, abilities, stats, types, moves, sprites} = data || {}

    const imgList = useMemo(() => {  //useMemo used to avoid re-rendering and multiple console logs
        return Object.keys(sprites || {}).filter(val => {
            if (!sprites[val]) { return false; }
            if (['versions', 'other'].includes(val)) { return false; }
            return true;
        });
    }, [sprites]);

    async function fetchMoveData(move, moveUrl) {
        if (loadingSkill || !localStorage || !moveUrl) {
            return;
        }

        let cache = {};

        if (localStorage.getItem('pokemon-moves')) {
            cache = JSON.parse(localStorage.getItem('pokemon-moves'));
        }

        if (move in cache) {
            setSkill(cache[move]); // Set the skill state from cache
            return;
        }

        try {
            setLoadingSkill(true);
            const res = await fetch(moveUrl);
            const moveData = await res.json();

            const description = moveData?.flavor_text_entries.filter(val => {
                return val.version_group.name === 'firered-leafgreen';
            })[0]?.flavor_text;

            const skillData = {
                name: move,
                description: description || 'No description available.',
            };

            cache[move] = skillData;
            localStorage.setItem('pokemon-moves', JSON.stringify(cache));

            setSkill(skillData); // Set the skill state with fetched data
        } catch (error) {
            console.error('Error fetching move data:', error);
        } finally {
            setLoadingSkill(false);
        }
    }

    useEffect(() => {
        // console.log("useEffect triggered with selectedPokemon:", selectedPokemon);

        if (loading || !localStorage) {
            console.log("Exiting early: loading is", loading, "or localStorage is unavailable");
            return;
        }

        let cache = {}

        if(localStorage.getItem('pokedex')){
            cache = JSON.parse(localStorage.getItem('pokedex'))
        }

        if(selectedPokemon in cache){

            setData(cache[selectedPokemon])
            return
        }

        // cache stuff complete, now we make the api call

        async function fetchPokeData(){

            console.log(" FETCHPOKEDATA CALLED")

            setLoading(true)
            
            try{

                let baseUrl = 'https://pokeapi.co/api/v2/'
                let suffix = 'pokemon/' + getPokedexNumber(selectedPokemon)
                
                let finalUrl = baseUrl + suffix

                console.log("API call triggered for:", selectedPokemon);

                const response = await fetch(finalUrl)

                const pokemonData = await response.json()

                setData(pokemonData)

                // console.log(pokemonData)

                cache[selectedPokemon] = pokemonData

                localStorage.setItem('pokedex', JSON.stringify(cache))

                setData(pokemonData)

            }
            catch (error) {
                if (error.response && error.response.status === 429) {
                    console.log("Rate limit exceeded. Retrying...");
                    setTimeout(fetchPokeData, 1000); // Retry after 1 second
                } else {
                    console.log(error);
                }
            }
            finally{
                setLoading(false)
            }

        }

        fetchPokeData()

    }, [selectedPokemon])

    if(loading || !data){
        return(
            <div>Loading...</div>
        )
    }

    // GET ALL THE CACHED POKEMONS{

    // const pokedexObj = JSON.parse(localStorage.getItem('pokedex'))

    // const pokedexArray = Object.values(pokedexObj)

    // pokedexArray.forEach(pokemon => {
    //     console.log(pokemon.name);
    // });

    // }

    return (
        <div className='pokemon-card pokecardMargin'>

            {skill && !loadingSkill && (
                <Modal handleCloseModal={() => { setSkill(null); }}>
                    <div>
                        <h6>Name</h6>
                        <h2 className='skill-name'>{skill.name.replaceAll('-', ' ')}</h2>
                    </div>
                    <div>
                        <h6>Description</h6>
                        <p>{skill.description}</p>
                    </div>
                </Modal>
            )}

            <div>
                <h4>
                    {getFullPokedexNumber(selectedPokemon)}
                    
                    {/* ${console.log(getFullPokedexNumber(selectedPokemon))} */}
                </h4>

                <h2>
                    {name}
                </h2>

                <div className="type-container">
                    <div className="types">
                        {types.map((typeObj, index) => {
                            
                            // console.log(`Type ${index}:`, typeObj.type.name); 

                            return (
                                <TypeCard key={index} type={typeObj?.type?.name} />
                            )})}

                            
                    </div>
                </div>

                <div>
                    <img className='default-img' src={'/pokemon/' + getFullPokedexNumber(selectedPokemon) + '.png'} alt={`${name}-large-img`} />
                </div>
                <div className='img-container'>
                {imgList.map((spriteUrl, spriteIndex) => {
                    const imgUrl = sprites[spriteUrl]
                    return (
                        <img key={spriteIndex} src={imgUrl} />
                    )
                })}
            </div>
            <h3>Stats</h3>
            <div className='stats-card'>
                {stats.map((statObj, statIndex) => {
                    const { stat, base_stat } = statObj
                    return (
                        <div key={statIndex} className='stat-item'>
                            <p>{stat?.name.replaceAll('-', ' ')}</p>
                            <h4>{base_stat}</h4>
                        </div>
                    )
                })}
            </div>
            <h3>Moves</h3>
            <div className='pokemon-move-grid'>

                {moves
                    .map((moveObj) => moveObj.move.name) // Extract move names
                    .sort() // Sort the move names
                    .map((moveName, moveIndex) => {
                        return (
                            <button
                                className='stats-button-card pokemon-move'
                                key={moveIndex}
                                onClick={() => {
                                    fetchMoveData(moveName, `https://pokeapi.co/api/v2/move/${moveName}`); // Pass moveName and moveUrl
                                }}
                            >
                                <p>{moveName.replaceAll('-', ' ')}</p>
                            </button>
                        );
                    })}

            </div>

            </div>
        </div>
    )
}
