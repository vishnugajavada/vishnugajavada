const GITHUB_USER = 'vishnugajavada';
const featuredRepos = new Set([
  'savora',
  'farewise',
  'alzheimer-quantum-graph-sage',
  'cricket-dashboard'
]);

const status = document.querySelector('#repo-status');
const repoGrid = document.querySelector('#repo-grid');

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function repoCard(repo) {
  const description = repo.description || 'A project by Vishnu Gajavada.';
  const language = repo.language || 'Open source';
  const stars = repo.stargazers_count ? ` · ★ ${repo.stargazers_count}` : '';
  const category = /python|javascript|typescript/i.test(language) ? 'backend' : 'data';
  return `<a class="repo-card project-card" data-category="${category}" data-search="${escapeHTML(`${repo.name} ${description} ${language}`.toLowerCase())}" href="${escapeHTML(repo.html_url)}" target="_blank" rel="noreferrer">
    <strong>${escapeHTML(repo.name)} <span>↗</span></strong>
    <p>${escapeHTML(description)}</p>
    <small>${escapeHTML(language)}${stars}</small>
  </a>`;
}

async function loadRepositories() {
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?type=owner&sort=updated&per_page=100`);
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const repositories = await response.json();
    const additional = repositories
      .filter((repo) => !repo.fork && repo.name.toLowerCase() !== 'my_portfolio' && !featuredRepos.has(repo.name.toLowerCase()))
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    if (!additional.length) {
      status.innerHTML = '<span class="status-dot"></span> Featured projects shown above · all repositories on GitHub';
      return;
    }

    repoGrid.innerHTML = additional.map(repoCard).join('');
    status.innerHTML = `<span class="status-dot"></span> ${repositories.filter((repo) => !repo.fork).length} public repositories · updated live from GitHub`;
    filterProjects();
  } catch (error) {
    status.innerHTML = '<span class="status-dot"></span> Featured projects shown above · browse the full repository list on GitHub';
  }
}

// Subtle pointer response makes the 3D sculpture feel tactile while keeping
// the animation CSS-only and lightweight.
const art = document.querySelector('.hero-art');
const cube = document.querySelector('.cube');
if (art && cube && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  art.addEventListener('pointermove', (event) => {
    const bounds = art.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    cube.style.animationPlayState = 'paused';
    cube.style.transform = `rotateX(${-28 - y * 18}deg) rotateY(${38 + x * 25}deg)`;
  });
  art.addEventListener('pointerleave', () => {
    cube.style.animationPlayState = 'running';
    cube.style.transform = '';
  });
}

loadRepositories();

let selectedFilter = 'all';
const searchInput = document.querySelector('#project-search');
const filterButtons = document.querySelectorAll('.filter-button');
const viewButtons = document.querySelectorAll('.view-button');
let selectedView = 'featured';

function filterProjects() {
  const query = (searchInput?.value || '').trim().toLowerCase();
  document.querySelectorAll('.project-card').forEach((card) => {
    const categories = (card.dataset.category || '').split(/\s+/);
    const searchable = `${card.dataset.search || ''} ${card.textContent}`.toLowerCase();
    const inView = selectedView === 'all' || card.classList.contains('featured-card');
    card.hidden = !(inView && searchable.includes(query) && (selectedFilter === 'all' || categories.includes(selectedFilter)));
  });
}

searchInput?.addEventListener('input', filterProjects);
filterButtons.forEach((button) => button.addEventListener('click', () => {
  selectedFilter = button.dataset.filter;
  filterButtons.forEach((item) => item.classList.toggle('active', item === button));
  filterProjects();
}));

viewButtons.forEach((button) => button.addEventListener('click', () => {
  selectedView = button.dataset.view;
  viewButtons.forEach((item) => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  filterProjects();
}));

const backToTop = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
  backToTop?.classList.toggle('visible', window.scrollY > 420);
}, { passive: true });

document.querySelector('.copy-email')?.addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const output = document.querySelector('.copy-status');
  try {
    await navigator.clipboard.writeText(button.dataset.email);
    output.textContent = 'Copied!';
    button.querySelector('span').textContent = '✓';
  } catch {
    window.location.href = `mailto:${button.dataset.email}`;
    output.textContent = 'Email opened';
  }
  window.setTimeout(() => {
    output.textContent = '';
    button.querySelector('span').textContent = '▣';
  }, 2200);
});
