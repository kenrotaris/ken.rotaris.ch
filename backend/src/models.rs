use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Portfolio {
    pub about: About,
    pub projects: Vec<TimelineItem>,
    pub experience: Vec<TimelineItem>,
    pub education: Vec<TimelineItem>,
    pub social: Social,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct About {
    pub name: String,
    pub title: String,
    pub bio: String,
    #[serde(rename = "profileImage")]
    pub profile_image: String,
    #[serde(rename = "faviconUrl")]
    pub favicon_url: String,
    #[serde(rename = "resumeUrl")]
    pub resume_url: String,
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TimelineItem {
    pub year: String,
    pub image: String,
    pub title: String,
    pub description: String,
    pub tags: Vec<String>,
    pub link: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Social {
    pub linkedin: String,
    pub github: String,
    pub email: String,
}
