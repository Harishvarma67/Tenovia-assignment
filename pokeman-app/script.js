const pokemonListContainer = document.getElementById('pokemonList');
const pokemonDetailsContainer = document.getElementById('pokemonDetails');

async function fetchPokemons() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=50');
        if (!response.ok) throw new Error('Failed to fetch Pokémon list');
        const data = await response.json();
        displayPokemons(data.results);
    } catch (error) {
        console.error(error);
        pokemonListContainer.innerHTML = '<p>Failed to load Pokémon data.</p>';
    }
}

function displayPokemons(pokemons) {
    pokemonListContainer.innerHTML = '';
    pokemons.forEach(pokemon => {
        const div = document.createElement('div');
        div.className = 'pokemon-item';
        div.textContent = pokemon.name;
        pokemonListContainer.appendChild(div);
    });
}

async function searchPokemon() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    if (!searchInput) {
        alert('Please enter a Pokémon name');
        return;
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchInput}`);
        if (!response.ok) throw new Error('Pokémon not found');
        const data = await response.json();
        displayPokemonDetails(data);
    } catch (error) {
        console.error(error);
        pokemonDetailsContainer.innerHTML = `<p>${error.message}</p>`;
    }
}

async function displayPokemonDetails(pokemon) {
    try {
        const speciesResponse = await fetch(pokemon.species.url);
        if (!speciesResponse.ok) throw new Error('Failed to fetch Pokémon species data');
        const speciesData = await speciesResponse.json();

        const weaknesses = await getWeaknesses(pokemon.types);
        const ability = pokemon.abilities[0]?.ability.name || 'N/A';
        const evolvesFrom = speciesData.evolves_from_species?.name || 'N/A';
        const category = speciesData.genera.find(genus => genus.language.name === 'en')?.genus || 'N/A';
        const height = `${pokemon.height / 10} m`;
        const weight = `${pokemon.weight / 10} kg`;

        pokemonDetailsContainer.innerHTML = `
            <h3>${pokemon.name.toUpperCase()}</h3>
            <p><strong>Weaknesses:</strong> ${weaknesses.join(', ')}</p>
            <p><strong>Ability:</strong> ${capitalize(ability)}</p>
            <p><strong>Evolves from:</strong> ${capitalize(evolvesFrom)}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Height:</strong> ${height}</p>
            <p><strong>Weight:</strong> ${weight}</p>
        `;
    } catch (error) {
        console.error(error);
        pokemonDetailsContainer.innerHTML = `<p>Error fetching additional details.</p>`;
    }
}

async function getWeaknesses(types) {
    try {
        let weaknesses = new Set();

        for (let typeInfo of types) {
            const response = await fetch(typeInfo.type.url);
            if (!response.ok) throw new Error('Failed to fetch type details');
            const typeData = await response.json();

            typeData.damage_relations.double_damage_from.forEach(weakness => {
                weaknesses.add(weakness.name);
            });
        }

        return Array.from(weaknesses).map(capitalize);
    } catch (error) {
        console.error(error);
        return ['N/A'];
    }
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Load the first 50 Pokémon on page load
fetchPokemons();
