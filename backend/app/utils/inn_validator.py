def validate_inn(inn: str) -> bool:
    if not inn or not inn.isdigit():
        return False

    if len(inn) == 10:
        coeffs = [2, 4, 10, 3, 5, 9, 4, 6, 8]
        control = sum(int(inn[i]) * coeffs[i] for i in range(9)) % 11 % 10
        return control == int(inn[9])

    if len(inn) == 12:
        coeffs1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]
        control1 = sum(int(inn[i]) * coeffs1[i] for i in range(10)) % 11 % 10

        coeffs2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]
        control2 = sum(int(inn[i]) * coeffs2[i] for i in range(11)) % 11 % 10

        return control1 == int(inn[10]) and control2 == int(inn[11])

    return False