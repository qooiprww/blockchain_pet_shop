pragma solidity ^0.5.0;

contract Adoption {
    address[100] public adopters;
    // variable for storing users that voted
    address[100] public voters;
    // variable for storing pet features
    mapping(uint256 => mapping(string => string)) public petFeatures;
    // variable for counting votes per pet
    uint256[100] public numVotes;

    bool[100] public pets;

    uint256 public currPetId;

    constructor() public {
        currPetId = 0;
    }

    // Adopting a pet
    function adopt(uint256 petId) public returns (uint256) {
        require(petId >= 0 && petId <= 99);
        adopters[petId] = msg.sender;
        return petId;
    }

    // donating to the Petshop
    function donate() public payable {
        require(msg.value > 0.01 ether);
    }

    // Retrieving the adopters
    function getAdopters() public view returns (address[100] memory) {
        return adopters;
    }

    // Vote for a pet
    function vote(uint256 petId) public returns (uint256) {
        require(petId >= 0 && petId <= 99);
        numVotes[petId] = numVotes[petId] + 1;
        voters[petId] = msg.sender;
        return numVotes[petId];
    }

    function getPets() public view returns (bool[100] memory) {
        return pets;
    }

    function getNumVotes() public view returns (uint256[100] memory) {
        return numVotes;
    }

    function filterPetsByBreed(string memory breed)
        public
        view
        returns (bool[100] memory)
    {
        uint256 length = pets.length;
        bool[100] memory result;
        if (
            keccak256(abi.encodePacked("")) ==
            keccak256(abi.encodePacked(breed))
        ) {
            for (uint256 j = 0; j < length; j++) {
                result[j] = true;
            }
            return result;
        }
        for (uint256 i = 0; i < length; i++) {
            if (
                keccak256(abi.encodePacked(petFeatures[i]["breed"])) ==
                keccak256(abi.encodePacked(breed))
            ) {
                result[i] = true;
            }
        }

        return result;
    }

    function filterPetsByAge(string memory age)
        public
        view
        returns (bool[100] memory)
    {
        uint256 length = pets.length;
        bool[100] memory result;
        if (
            keccak256(abi.encodePacked("")) == keccak256(abi.encodePacked(age))
        ) {
            for (uint256 j = 0; j < length; j++) {
                result[j] = true;
            }
            return result;
        }
        for (uint256 i = 0; i < length; i++) {
            if (
                keccak256(abi.encodePacked(petFeatures[i]["age"])) ==
                keccak256(abi.encodePacked(age))
            ) {
                result[i] = true;
            }
        }
        return result;
    }

    function syncPet(
        uint256 id,
        string memory breed,
        string memory name,
        string memory age,
        string memory picture,
        string memory location
    ) public returns (uint256) {
        if (id > currPetId) {
            currPetId = id + 1;
        }
        pets[id] = true;
        petFeatures[id]["breed"] = breed;
        petFeatures[id]["age"] = age;
        petFeatures[id]["name"] = name;
        petFeatures[id]["picture"] = picture;
        petFeatures[id]["location"] = location;
        numVotes[id] = 0;
        return currPetId;
    }

    function registerPet(
        string memory breed,
        string memory name,
        string memory age,
        string memory picture,
        string memory location
    ) public returns (uint256) {
        pets[currPetId] = true;
        petFeatures[currPetId]["breed"] = breed;
        petFeatures[currPetId]["age"] = age;
        petFeatures[currPetId]["name"] = name;
        petFeatures[currPetId]["picture"] = picture;
        petFeatures[currPetId]["location"] = location;
        numVotes[currPetId] = 0;
        currPetId = currPetId + 1;
        return currPetId;
    }

    function getPetName(uint256 petId) public view returns (string memory) {
        require(petId >= 0 && petId <= 99);
        return petFeatures[petId]["name"];
    }

    function getPetAge(uint256 petId) public view returns (string memory) {
        require(petId >= 0 && petId <= 99);
        return petFeatures[2]["age"];
    }

    function getPetBreed(uint256 petId) public view returns (string memory) {
        require(petId >= 0 && petId <= 99);
        return petFeatures[petId]["breed"];
    }

    function getPetPicture(uint256 petId) public view returns (string memory) {
        require(petId >= 0 && petId <= 99);
        return petFeatures[petId]["picture"];
    }

    function getPetLocation(uint256 petId) public view returns (string memory) {
        require(petId >= 0 && petId <= 99);
        return petFeatures[petId]["location"];
    }

    function getPetNumVotes(uint256 petId) public view returns (uint256) {
        require(petId >= 0 && petId <= 99);
        return numVotes[petId];
    }

    function getMostAdoptedBreed() public view returns (string memory) {
        uint256 length = pets.length;
        string[100] memory breeds;
        uint256[100] memory counter;
        uint256 index = 0;
        bool found = false;
        for (uint256 i = 0; i < length; i++) {
            if ((adopters[i] != address(0)) && pets[i]) {
                found = false;
                for (uint256 j = 0; j < index; j++) {
                    if (
                        keccak256(abi.encodePacked(petFeatures[i]["breed"])) ==
                        keccak256(abi.encodePacked(breeds[j]))
                    ) {
                        counter[j]++;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    breeds[index] = petFeatures[i]["breed"];
                    counter[index] = 1;
                    index++;
                }
            }
        }

        uint256 largest = 0;
        string memory result;

        for (uint256 i = 0; i < index; i++) {
            if (counter[i] > largest) {
                largest = counter[i];
                result = breeds[i];
            }
        }
        if (largest == 0) {
            result = "No adoption yet";
        }

        return result;
    }

    function getMostAdoptedAge() public view returns (string memory) {
        uint256 length = pets.length;
        string[100] memory ages;
        uint256[100] memory counter;
        uint256 index = 0;
        bool found = false;
        for (uint256 i = 0; i < length; i++) {
            if ((adopters[i] != address(0)) && pets[i]) {
                found = false;
                for (uint256 j = 0; j < index; j++) {
                    if (
                        keccak256(abi.encodePacked(petFeatures[i]["age"])) ==
                        keccak256(abi.encodePacked(ages[j]))
                    ) {
                        counter[j]++;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    ages[index] = petFeatures[i]["age"];
                    counter[index] = 1;
                    index++;
                }
            }
        }

        uint256 largest = 0;
        string memory result;

        for (uint256 i = 0; i < index; i++) {
            if (counter[i] > largest) {
                largest = counter[i];
                result = ages[i];
            }
        }
        if (largest == 0) {
            result = "No adoption yet";
        }

        return result;
    }
}
