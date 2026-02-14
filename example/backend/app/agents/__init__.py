from app.agents.scout import scout_agent
from app.agents.legalist import legalist_agent
from app.agents.shrink import shrink_agent
from app.agents.historian import historian_agent
from app.agents.modernist import modernist_agent
from app.agents.auditor import auditor_agent
from app.agents.bureaucrat import bureaucrat_agent
from app.agents.analyst import analyst_agent
from app.agents.ecologist import ecologist_agent
from app.agents.citizen import citizen_agent

# Eksport wszystkich agentów jako słownik dla łatwego dostępu
AGENTS = {
    "scout": scout_agent,
    "legalist": legalist_agent,
    "shrink": shrink_agent,
    "historian": historian_agent,
    "modernist": modernist_agent,
    "auditor": auditor_agent,
    "bureaucrat": bureaucrat_agent,
    "analyst": analyst_agent,
    "ecologist": ecologist_agent,
    "citizen": citizen_agent
}
