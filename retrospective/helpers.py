def identify_missing_sources(oh_member):
    missing_sources = {"oura": True, "fitbit": True}
    for i in oh_member.list_files():
        if i["source"] == "direct-sharing-184" and i["basename"] == "oura-data.json":
            missing_sources.pop("oura", None)
        if i["basename"] == "fitbit-data.json" and i["source"] == "direct-sharing-102":
            missing_sources.pop("fitbit", None)
    return list(missing_sources.keys())
