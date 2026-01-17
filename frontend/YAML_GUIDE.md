# Portfolio YAML Configuration Guide

## New Optional Fields (Added in Latest Update)

### 1. Metadata (Page Title & Description)

Control what appears in browser tabs and search results:

```yaml
metadata:
  title: "Ken Rotaris - Full-Stack Developer"
  description: "Swiss systems-focused software engineer with 7+ years of experience"
  author: "Ken Rotaris"
```

**Default if omitted:** `title: "Portfolio"`, `description: "Professional Portfolio"`

---

### 2. Timezone

Customize the timezone shown in the header clock:

```yaml
theme:
  colors:
    accent: '#624AFF'
    background: '#4D00FF'
  timezone: 'CET'  # ← Add this line
```

**Default if omitted:** `"UTC"`

**Common values:** `CET`, `EST`, `PST`, `JST`, `GMT`, `IST`, etc.

---

### 3. Footer Owner Name

Customize the copyright name in the footer:

```yaml
footer:
  social:
    linkedin: https://www.linkedin.com/in/kenrotaris/
    github: https://github.com/kenrotaris
    email: ken@rotaris.ch
    ownerName: "Ken Rotaris"  # ← Add this line
```

**Default if omitted:** Falls back to `hero.name` → `"Portfolio"`

---

## Recommended Additions to Your Current YAML

Add these sections to `/frontend/public/data/portfolio.yaml`:

```yaml
# Add at the top (after hero section)
metadata:
  title: "Ken Rotaris - Full-Stack Developer"
  description: "Swiss systems-focused software engineer with 7+ years of experience in backend development, web technologies, and DevOps"
  author: "Ken Rotaris"

# Update theme section (add timezone)
theme:
  colors:
    accent: '#624AFF'
    background: '#4D00FF'
  timezone: 'CET'  # Switzerland timezone

# Update footer section (add ownerName)
footer:
  social:
    linkedin: https://www.linkedin.com/in/kenrotaris/
    github: https://github.com/kenrotaris
    email: ken@rotaris.ch
    ownerName: "Ken Rotaris"
```

---

## All Existing Fields (No Changes Needed)

These continue to work exactly as before:

- ✅ `hero` - Name, title, bio, images, resume URL
- ✅ `tabs` - Experience, education, projects, volunteering
- ✅ `theme.colors.accent` - Primary brand color
- ✅ `theme.colors.background` - Background accent color
- ✅ `footer.social` - LinkedIn, GitHub, email links

---

## Testing Your Changes

After updating the YAML:

1. **Development:** `npm run dev` - See changes immediately
2. **Production:** `npm run build` - Verify build succeeds
3. **Check metadata:** Open browser DevTools → Elements → `<head>` → verify `<title>` and `<meta>` tags
4. **Check timezone:** Look at header clock display
5. **Check footer:** Scroll down to see copyright name
