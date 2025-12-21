const roleColors = {
  Duelist: "#ff4655",
  Initiator: "#1cffc9",
  Controller: "#8d8df0",
  Sentinel: "#ffd166",
};

const roleIcons = {
  Duelist: "bi-arrow-up-right-circle-fill",
  Initiator: "bi-lightning-charge-fill",
  Controller: "bi-eye-fill",
  Sentinel: "bi-shield-fill",
};

async function fetchAgents() {
  try {
    const response = await fetch(
      "https://valorant-api.com/v1/agents?isPlayableCharacter=true"
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
}

function createAgentCard(agent) {
  const roleColor = roleColors[agent.role.displayName] || "#ffffff";
  const roleIcon = roleIcons[agent.role.displayName] || "bi-person-fill";
  const placeholder = `https://via.placeholder.com/400x600/0f1923/ffffff?text=${agent.displayName}`;

  return `
    <div class="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
      <div class="agent-card" onclick="showAgentDetails('${agent.uuid}')">
        <div class="agent-img-container">
          <img src="${agent.fullPortrait || agent.displayIcon}" 
               alt="${agent.displayName}" 
               class="agent-img"
               onerror="this.src='${placeholder}'">
        </div>
        <div class="agent-info">
          <h3 class="agent-name">${agent.displayName}</h3>
          <div class="d-flex align-items-center">
            <i class="bi ${roleIcon} me-2" style="color: ${roleColor}"></i>
            <p class="agent-role m-0" style="color: ${roleColor}">${
    agent.role.displayName
  }</p>
          </div>
        </div>
      </div>
    </div>`;
}

async function showAgentDetails(agentUuid) {
  try {
    const response = await fetch(
      `https://valorant-api.com/v1/agents/${agentUuid}`
    );
    const data = await response.json();
    const agent = data.data;
    const roleColor = roleColors[agent.role.displayName] || "#ffffff";
    const roleIcon = roleIcons[agent.role.displayName] || "bi-person-fill";
    const placeholder = `https://via.placeholder.com/500x700/0f1923/ffffff?text=${agent.displayName}`;

    let abilitiesHtml = "";
    if (agent.abilities) {
      const sortedAbilities = [...agent.abilities].sort((a, b) => {
        const order = [
          "Ability1",
          "Ability2",
          "Grenade",
          "Ultimate",
          "Passive",
        ];
        return order.indexOf(a.slot) - order.indexOf(b.slot);
      });

      abilitiesHtml = '<div class="abilities-container">';
      sortedAbilities.forEach((ability) => {
        if (ability.displayName && ability.description) {
          const slotName =
            ability.slot === "Ultimate"
              ? "ULTIMATE"
              : ability.slot === "Grenade"
              ? "GRENADE"
              : ability.slot === "Passive"
              ? "PASSIVE"
              : "ABILITY";

          abilitiesHtml += `
            <div class="ability-card">
              <div class="ability-header">
                <div class="ability-icon">
                  <img src="${ability.displayIcon || ""}" alt="${
            ability.displayName
          }" onerror="this.style.display='none'">
                </div>
                <div class="ability-name">${ability.displayName}</div>
              </div>
              <div class="ability-desc">${ability.description}</div>
              <div class="ability-slot">${slotName}</div>
            </div>`;
        }
      });
      abilitiesHtml += "</div>";
    }

    const modalHtml = `
      <div class="modal fade" id="agentModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <div class="modal-title-icon" style="background-color: ${roleColor}20; border: 2px solid ${roleColor}">
                  <i class="bi ${roleIcon}" style="color: ${roleColor}"></i>
                </div>
                ${agent.displayName}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-5">
                  <img src="${agent.fullPortrait || agent.displayIcon}" 
                       alt="${agent.displayName}" 
                       class="img-fluid rounded mb-3"
                       style="border: 2px solid ${roleColor}"
                       onerror="this.src='${placeholder}'">
                  <div class="agent-role-container">
                    <div class="agent-role-icon" style="color: ${roleColor}; border: 2px solid ${roleColor}">
                      <i class="bi ${roleIcon}"></i>
                    </div>
                    <div class="agent-role-tag" style="background-color: ${roleColor}">${
      agent.role.displayName
    }</div>
                  </div>
                </div>
                <div class="col-md-7">
                  <h5 style="color: var(--valorant-red)">Description</h5>
                  <p class="mb-4">${
                    agent.description || "No description available."
                  }</p>
                  <h5 style="color: var(--valorant-red)">Biography</h5>
                  <p class="mb-4">${
                    agent.developerName || "No biography available."
                  }</p>
                  <h5 style="color: var(--valorant-red)">Abilities</h5>
                  ${
                    abilitiesHtml ||
                    '<p class="text-muted">No abilities information available.</p>'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    const existingModal = document.getElementById("agentModal");
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML("beforeend", modalHtml);
    new bootstrap.Modal(document.getElementById("agentModal")).show();
  } catch (error) {
    console.error("Error fetching agent details:", error);
    alert("Error loading agent details. Please try again.");
  }
}

async function initializeAgentsPage() {
  const contentArea = document.getElementById("contentArea");
  if (!contentArea) return;

  contentArea.innerHTML = `
    <div class="col-12">
      <div class="text-center py-5">
        <div class="spinner-border text-danger" role="status" style="width: 3rem; height: 3rem;"></div>
        <p class="mt-3">Loading agents...</p>
      </div>
    </div>`;

  try {
    const agents = await fetchAgents();
    agents.sort((a, b) => a.displayName.localeCompare(b.displayName));
    contentArea.innerHTML = "";

    if (agents.length === 0) {
      contentArea.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">No agents found. Please try again later.</div>
        </div>`;
      return;
    }

    agents.forEach((agent) => {
      contentArea.innerHTML += createAgentCard(agent);
    });
  } catch (error) {
    contentArea.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">Error loading agents. Please check your connection.</div>
      </div>`;
  }
}

async function initializeSearchPage() {
  const contentArea = document.getElementById("contentArea");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  if (!contentArea) return;

  let allAgents = [];

  try {
    allAgents = await fetchAgents();
    allAgents.sort((a, b) => a.displayName.localeCompare(b.displayName));
    contentArea.innerHTML = "";

    if (allAgents.length === 0) {
      contentArea.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">No agents available. Please try again later.</div>
        </div>`;
      return;
    }

    allAgents.forEach((agent) => {
      contentArea.innerHTML += createAgentCard(agent);
    });
  } catch (error) {
    contentArea.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">Error loading agents. Please check your connection.</div>
      </div>`;
  }

  function performSearch() {
    if (!searchInput) return;
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === "") {
      contentArea.innerHTML = "";
      allAgents.forEach((agent) => {
        contentArea.innerHTML += createAgentCard(agent);
      });
      return;
    }

    const filteredAgents = allAgents.filter(
      (agent) =>
        agent.displayName.toLowerCase().includes(searchTerm) ||
        (agent.developerName &&
          agent.developerName.toLowerCase().includes(searchTerm)) ||
        agent.role.displayName.toLowerCase().includes(searchTerm) ||
        (agent.description &&
          agent.description.toLowerCase().includes(searchTerm))
    );

    contentArea.innerHTML = "";

    if (filteredAgents.length === 0) {
      contentArea.innerHTML = `
        <div class="col-12">
          <div class="text-center py-5">
            <h3 style="color: var(--valorant-red)">No agents found</h3>
            <p class="text-muted">Try searching with a different term</p>
          </div>
        </div>`;
      return;
    }

    filteredAgents.forEach((agent) => {
      contentArea.innerHTML += createAgentCard(agent);
    });
  }

  if (searchBtn) searchBtn.addEventListener("click", performSearch);
  if (searchInput)
    searchInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") performSearch();
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const agentCountElement = document.getElementById("agentCount");
  if (agentCountElement) {
    fetchAgentCount();
  }

  const contentArea = document.getElementById("contentArea");
  if (contentArea) {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      initializeSearchPage();
    } else {
      initializeAgentsPage();
    }
  }
});

async function fetchAgentCount() {
  try {
    const response = await fetch(
      "https://valorant-api.com/v1/agents?isPlayableCharacter=true"
    );
    const data = await response.json();
    document.getElementById("agentCount").textContent = data.data.length;
  } catch (error) {
    console.error("Error fetching agent count:", error);
  }
}
