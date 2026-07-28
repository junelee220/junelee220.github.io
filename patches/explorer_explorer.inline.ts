// @ts-nocheck - Required for inline scripts that run in browser context
import { resolveBasePath } from "@quartz-community/utils/path";

async function handleNavOrRender(e) {
  try {
    const currentSlug = (e?.detail?.url || "").replace(/^\/+/, "");
    const allExplorers = document.querySelectorAll("div.explorer");

    const data = await fetchData;
    const contentData = data.content || data;
    const tags = [...new Set(
      Object.values(contentData).flatMap((entry) => entry.tags || [])
    )].sort();

    for (const explorer of allExplorers) {
      const explorerUl = explorer.querySelector(".explorer-ul");
      if (!explorerUl) continue;

      explorerUl.innerHTML = "";

      tags.forEach((tag) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = resolveBasePath("tags/" + tag);
        a.className = "internal tag-link";
        a.textContent = "#" + tag;
        const tagSlug = "tags/" + tag;
        if (tagSlug === currentSlug || tagSlug + "/index" === currentSlug) {
          a.classList.add("active", "is-active");
        }
        li.appendChild(a);
        explorerUl.appendChild(li);
      });

      const scrollTop = sessionStorage.getItem("explorerScrollTop");
      if (scrollTop) {
        explorerUl.scrollTop = parseInt(scrollTop, 10);
      } else {
        const activeElement = explorerUl.querySelector(".active");
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    }

    for (const explorer of document.getElementsByClassName("explorer")) {
      const mobileExplorer = explorer.querySelector(".mobile-explorer");
      if (!mobileExplorer) continue;
      mobileExplorer.classList.remove("hide-until-loaded");
      if (mobileExplorer.checkVisibility && mobileExplorer.checkVisibility()) {
        explorer.classList.add("collapsed");
        explorer.setAttribute("aria-expanded", "false");
        document.documentElement.classList.remove("mobile-no-scroll");
      }
    }
  } catch (err) {
    console.error("[Explorer] Error:", err);
  }
}

document.addEventListener("nav", handleNavOrRender);
document.addEventListener("render", handleNavOrRender);

document.addEventListener("prenav", () => {
  const explorer = document.querySelector(".explorer-ul");
  if (!explorer) return;
  sessionStorage.setItem("explorerScrollTop", explorer.scrollTop.toString());
});
