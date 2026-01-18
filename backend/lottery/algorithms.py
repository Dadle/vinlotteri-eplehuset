"""
Draw algorithms for the wine lottery.

Each algorithm takes a list of participants and historical data,
and returns the selected winner.
"""

import random
from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class Participant:
    """Represents a participant in a draw."""
    name: str
    ticket_count: int


def pure_random(participants: List[Participant], history: Optional[List[Dict[str, Any]]] = None) -> str:
    """
    Pure random selection weighted by ticket count.
    Each ticket = one entry in the pool.
    
    Args:
        participants: List of participants with ticket counts
        history: Not used in this algorithm
    
    Returns:
        Name of the winner
    """
    if not participants:
        raise ValueError("No participants provided")
    
    # Create weighted pool
    pool = []
    for p in participants:
        pool.extend([p.name] * p.ticket_count)
    
    return random.choice(pool)


def weighted_by_losses(participants: List[Participant], history: Optional[List[Dict[str, Any]]] = None) -> str:
    """
    Weighted selection that gives bonus weight to participants with fewer historical wins.
    
    Args:
        participants: List of participants with ticket counts
        history: List of dicts with 'name' and 'wins' keys
    
    Returns:
        Name of the winner
    """
    if not participants:
        raise ValueError("No participants provided")
    
    history = history or []
    
    # Create a mapping of name -> wins
    wins_map = {h['name']: h['wins'] for h in history}
    
    # Calculate max wins for normalization
    max_wins = max(wins_map.values()) if wins_map else 0
    
    # Create weighted pool with loss bonus
    pool = []
    for p in participants:
        wins = wins_map.get(p.name, 0)
        # Base weight is ticket count
        # Bonus multiplier: (max_wins - wins + 1) gives more weight to those with fewer wins
        loss_bonus = max_wins - wins + 1
        weight = p.ticket_count * loss_bonus
        pool.extend([p.name] * weight)
    
    return random.choice(pool)


def round_robin_fair(participants: List[Participant], history: Optional[List[Dict[str, Any]]] = None) -> str:
    """
    Prioritize participants who haven't won recently.
    Participants with no recent wins get highest priority.
    
    Args:
        participants: List of participants with ticket counts
        history: List of dicts with 'name' and 'last_win_date' keys (ISO format or None)
    
    Returns:
        Name of the winner
    """
    if not participants:
        raise ValueError("No participants provided")
    
    history = history or []
    
    # Create mapping of name -> last win info
    last_win_map = {}
    for h in history:
        if h.get('last_win_date'):
            last_win_map[h['name']] = h['last_win_date']
    
    # Separate participants into those who never won and those who have
    never_won = [p for p in participants if p.name not in last_win_map]
    have_won = [p for p in participants if p.name in last_win_map]
    
    # If there are participants who never won, prioritize them
    if never_won:
        # Among never-won participants, use pure random weighted by tickets
        return pure_random(never_won)
    
    # Sort by last win date (oldest first)
    have_won.sort(key=lambda p: last_win_map.get(p.name, ''))
    
    # Give higher weight to those who won longest ago
    # Use position-based weighting (first = highest weight)
    pool = []
    for i, p in enumerate(have_won):
        # Weight decreases as we go through the sorted list
        # First person (longest since win) gets len(have_won) * ticket_count entries
        weight = (len(have_won) - i) * p.ticket_count
        pool.extend([p.name] * weight)
    
    return random.choice(pool)


def equal_chance(participants: List[Participant], history: Optional[List[Dict[str, Any]]] = None) -> str:
    """
    Equal chance for all participants regardless of ticket count.
    Each participant has exactly one entry.
    
    Args:
        participants: List of participants (ticket count ignored)
        history: Not used in this algorithm
    
    Returns:
        Name of the winner
    """
    if not participants:
        raise ValueError("No participants provided")
    
    return random.choice([p.name for p in participants])


# Algorithm registry
ALGORITHMS = {
    'pure_random': {
        'func': pure_random,
        'name': 'Pure Random',
        'description': 'Each ticket equals one entry. More tickets = higher chance.',
        'needs_history': False,
    },
    'weighted_losses': {
        'func': weighted_by_losses,
        'name': 'Weighted by Losses',
        'description': 'Participants with fewer historical wins get bonus weight.',
        'needs_history': True,
    },
    'round_robin': {
        'func': round_robin_fair,
        'name': 'Round-Robin Fair',
        'description': 'Prioritizes those who haven\'t won recently.',
        'needs_history': True,
    },
    'equal_chance': {
        'func': equal_chance,
        'name': 'Equal Chance',
        'description': 'Ignores ticket count. Everyone has the same chance.',
        'needs_history': False,
    },
}


def execute_draw(algorithm_key: str, participants: List[Participant], history: Optional[List[Dict[str, Any]]] = None) -> str:
    """
    Execute a draw using the specified algorithm.
    
    Args:
        algorithm_key: Key from ALGORITHMS dict
        participants: List of Participant objects
        history: Historical data (format depends on algorithm)
    
    Returns:
        Name of the winner
    
    Raises:
        ValueError: If algorithm key is invalid or no participants
    """
    if algorithm_key not in ALGORITHMS:
        raise ValueError(f"Unknown algorithm: {algorithm_key}")
    
    algorithm = ALGORITHMS[algorithm_key]
    return algorithm['func'](participants, history)


def get_algorithm_info() -> List[Dict[str, str]]:
    """Get information about all available algorithms."""
    return [
        {
            'key': key,
            'name': algo['name'],
            'description': algo['description'],
        }
        for key, algo in ALGORITHMS.items()
    ]
