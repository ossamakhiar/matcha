type GenderProps = {
    gender: string;
    iconsFolder: string;
};

function Gender({gender, iconsFolder}: GenderProps) {
    function genderIconPath(): string {
        let svgPath = '';
        const genders = new Set(['male', 'female', 'transgender']);

        if (gender === 'transgender-male' || gender === 'transgender-female') {
            gender = 'transgender';            
        }

        if (genders.has(gender)) {
            svgPath = `${iconsFolder}/${gender}.svg`;
        }

        return svgPath;
    }

    return (
        <img src={genderIconPath()} alt="gender icon" style={{width: 24}}></img>
    )
}

export default Gender;