pragma solidity ^0.5.0;

contract Adoption {
    address[] public adopters;
    // variable for storing users that voted
    address[] public voters;
    // variable for storing pet features
    mapping(uint256 => mapping(string => string)) petFeatures;
    // variable for counting votes per pet
    uint256[] numVotes;

    uint256[] public pets;

    uint256 currPetId = 0;

    // Adopting a pet
    function adopt(uint256 petId) public returns (uint256) {
        adopters.push(msg.sender);
        return petId;
    }

    // donating to the Petshop
    function donate() public payable {
        require(msg.value > 0.01 ether);
    }

    // Retrieving the adopters
    function getAdopters() public view returns (address[] memory) {
        return adopters;
    }

    // Vote for a pet
    function vote(uint256 petId) public returns (uint256) {
        numVotes[petId] = numVotes[petId] + 1;
        voters.push(msg.sender);
        return numVotes[petId];
    }

    function getPets() public view returns (uint256[] memory) {
        return pets;
    }

    function filterPetsByBreed(string breed) public view returns (uint256[] memory) {
        uint256[] memory result;
        for(int i = 0; i < petFeatures.length, i++ ){
            if(petFeatures[i] == breed){
                result.push(i);
            }
        }
        return result;
    }

    function registerPet(
        string memory breed,
        string memory name,
        string memory age
    ) public returns (uint256) {
        pets.push(currPetId);
        petFeatures[currPetId]["breed"] = breed;
        petFeatures[currPetId]["age"] = age;
        petFeatures[currPetId]["name"] = name;
        numVotes[currPetId] = 0;
        currPetId = currPetId + 1;
        return currPetId;
    }

    function getPetName(uint256 petId) public view returns (string memory) {
        return petFeatures[petId]["name"];
    }

    function getPetAge(uint256 petId) public view returns (string memory) {
        return petFeatures[petId]["age"];
    }

    function getPetBreed(uint256 petId) public view returns (string memory) {
        return petFeatures[petId]["breed"];
    }

    function getPetNumVotes(uint256 petId) public view returns (uint256) {
        return numVotes[petId];
    }
}
