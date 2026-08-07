def initials(name: str) -> str:
    parts = name.split()
    return "".join(p[0] for p in parts[:2]).upper()