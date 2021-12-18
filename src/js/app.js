App = {
  web3Provider: null,
  contracts: {},
  init: async function () {
    // Load pets.
    $.getJSON('../pets.json', function (data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        petTemplate.find('.btn-vote').attr('data-id', data[i].id);
        petsRow.append(petTemplate.html());
      }
    });
    return await App.initWeb3();
  },
  initWeb3: async function () {

    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },
  initContract: function () {
    $.getJSON('Adoption.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
      // Load pets.

      App.syncPets();
      App.updateVotes();
      App.updateBreedStats();
      App.updateAgeStat();
      return App.markAdopted();
    });

    return App.bindEvents();
  },
  bindEvents: function () { //Done
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-vote', App.handleVote);
    $(document).on('submit', '#donation', App.handleDonation);
    $(document).on('submit', '#register', App.handleRegistration);
    $(document).on('submit', '#breed-filter-form', App.filterByBreed);
    $(document).on('submit', '#age-filter-form', App.filterByAge);
  },
  syncPets: function () { //Done
    $.getJSON('../pets.json', function (data) {
      for (let i = 0; i < data.length; i++) {
        App.registermissingPets(data[i]);
      }
    });
    App.contracts.Adoption.deployed().then(function (instance) {
      petIdInstance = instance;

      // Execute adopt as a transaction by sending account
      return petIdInstance.getPets.call();
    }).then((petIds) => {

      for (let i = 16; i < petIds.length; i++) {
        if (petIds[i] & i > ($('.panel-pet').length - 2)) {
          let petsRow = $('#petsRow');
          let petTemplate = $('#petTemplate');
          petsRow.append(petTemplate.html());
          App.updateNames();
          App.updateBreeds();
          App.updateLocations();
          App.updateAges();
          App.updatePictures();
        }
      }
    }).catch((inneErr) => {
      console.log(inneErr.message);
    });
  },
  markAdopted: function (adopters, account) { //Done
    var meta;

    App.contracts.Adoption.deployed().then(function (instance) {
      meta = instance;

      return meta.getAdopters.call();
    }).then(function (adopters) {
      App.updateBreedStats();
      App.updateAgeStat();
      for (let i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('.btn-adopt').text('Success').attr('disabled', true);
        }
      }
    }).catch(function (err) {
      console.log(err.message);
    });
  },
  updateVotes: function () { //Done
    var meta;

    App.contracts.Adoption.deployed().then(function (instance) {
      meta = instance;

      return meta.getNumVotes.call();
    }).then(function (numVotes) {
      numVotesList = numVotes.map(numVote => parseInt(numVote.c[0]))
      var goodBoy = 0;
      for (let i = 0; i < numVotesList.length; i++) {
        if (numVotesList[i] > numVotesList[goodBoy]) {
          goodBoy = i;
        }
        $('.panel-pet').eq(i).find('.pet-vote').text(numVotesList[i]);
      }
      if (numVotesList[goodBoy] != 0) {
        var dogName = $('.panel-pet').eq(goodBoy).find('.panel-title').text();
        $('.popular-dog').text("Most Popular Dog: " + dogName)
      }
      else {
        $('.popular-dog').text("Most Popular Dog: No Vote Yet!")
      }

    }).catch(function (err) {
      console.log(err.message);
    });
  },
  updateBreedStats: function () { //Done
    var meta;
    App.contracts.Adoption.deployed().then(function (instance) {
      meta = instance;
      // Execute adopt as a transaction by sending account
      return meta.getMostAdoptedBreed.call();
    }).then(function (breed) {
      $('.stat-breed').text(breed);
    });
  },
  updateAgeStat: function () { //Done
    var meta;
    App.contracts.Adoption.deployed().then(function (instance) {
      meta = instance;
      // Execute adopt as a transaction by sending account
      return meta.getMostAdoptedAge.call();
    }).then(function (age) {
      $('.stat-age').text(age);
    })
  },
  updateNames: function () { //Done
    var meta;
    for (let name_index = 16; name_index < ($('.panel-pet').length - 1); name_index++) {
      App.contracts.Adoption.deployed().then(function (instance) {
        meta = instance;
        // Execute adopt as a transaction by sending account
        return meta.getPetName.call(name_index);
      }).then(function (petName) {
        $('.panel-pet').eq(name_index).find('.panel-title').text(petName);
      })
    }
  },
  updateBreeds: function () { //Done
    var meta;
    for (let breed_index = 16; breed_index < ($('.panel-pet').length - 1); breed_index++) {
      App.contracts.Adoption.deployed().then(function (instance) {
        meta = instance;
        // Execute adopt as a transaction by sending account
        return meta.getPetBreed.call(breed_index);
      }).then(function (petBreed) {
        $('.panel-pet').eq(breed_index).find('.pet-breed').text(petBreed);
      })
    }
  },
  updateAges: function () { //Done
    var meta;
    for (let age_index = 16; age_index < ($('.panel-pet').length - 1); age_index++) {
      App.contracts.Adoption.deployed().then(function (instance) {
        meta = instance;
        // Execute adopt as a transaction by sending account
        return meta.getPetAge.call(age_index);
      }).then(function (petAge) {
        $('.panel-pet').eq(age_index).find('.pet-age').text(petAge);
      })
    }
  },
  updateLocations: function () { //Done
    var meta;
    for (let location_index = 16; location_index < ($('.panel-pet').length - 1); location_index++) {
      App.contracts.Adoption.deployed().then(function (instance) {
        meta = instance;
        // Execute adopt as a transaction by sending account
        return meta.getPetLocation.call(location_index);
      }).then(function (petLocation) {
        $('.panel-pet').eq(location_index).find('.pet-location').text(petLocation);
      })
    }
  },
  updatePictures: function () { //Done
    var meta;
    for (let picture_index = 16; picture_index < ($('.panel-pet').length - 1); picture_index++) {
      App.contracts.Adoption.deployed().then(function (instance) {
        meta = instance;
        // Execute adopt as a transaction by sending account
        return meta.getPetPicture.call(picture_index);
      }).then(function (petPicture) {
        $('.panel-pet').eq(picture_index).find('img').attr('src', petPicture);
      })
    }
  },
  registermissingPets: function (petData) { //Done
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function (instance) {
        meta = instance;

        // Execute adopt as a transaction by sending account
        return meta.getPets.call();
      }).then((petIds) => {
        if (!petIds[petData.id]) {
          return meta.syncPet(petData.id, petData.breed, petData.name, petData.age.toString(), petData.picture, petData.location, { from: account, gas: 320000 });
        }
      }).catch((inneErr) => {
        console.log(inneErr.message);
      });
    })
  },
  registerPet: function (petData) {
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function (instance) {
        meta = instance;

        // Execute adopt as a transaction by sending account
        return meta.registerPet(petData.breed, petData.name, petData.age.toString(), petData.picture, petData.location, { from: account, gas: 320000 });
      }).then((result) => {
        App.syncPets();
        $('.btn-register').text("Success");
      }).catch((inneErr) => {
        console.log(inneErr.message);
      });
    })
  },
  handleAdopt: function (event) { //Done
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var meta;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function (instance) {
        meta = instance;

        // Execute adopt as a transaction by sending account
        return meta.adopt(petId, { from: account });
      }).then(function (result) {
        return App.markAdopted();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },
  handleVote: function (event) { //Done
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function (instance) {
        meta = instance;

        // Execute adopt as a transaction by sending account
        return meta.vote(petId, { from: account });
      }).then(function (result) {
        $('.panel-pet').eq(petId).find('.btn-vote').text('Success');
        App.updateVotes();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },
  handleDonation: function (event) { //Done
    event.preventDefault();

    let isDonationAmountValid = App.checkDonationAmount();

    if (isDonationAmountValid) {

      var donationAmount = document.querySelector('#donation-amount').value;

      var meta;

      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0];

        App.contracts.Adoption.deployed().then(function (instance) {
          meta = instance;

          // Execute adopt as a transaction by sending account
          return meta.donate({ from: account, value: web3.toWei(donationAmount, "ether") });
        }).then(function (result) {
          $('.btn-donate').text('Thank you!');
        }).catch(function (err) {
          console.log(err.message);
        });
      });
    }
  },
  handleRegistration: function (event) { //Done
    event.preventDefault();

    let isRegistrationFormValid = App.checkRegistrationForm();

    if (isRegistrationFormValid) {
      var newPet = {
        age: parseInt(document.querySelector('#register-age').value),
        breed: document.querySelector('#register-breed').value,
        name: document.querySelector('#register-name').value,
        location: document.querySelector('#register-location').value,
        picture: document.querySelector('#register-picture').value,
      }
      App.registerPet(newPet);
    }
  },
  checkDonationAmount: function () { //Done
    let valid = false;
    let donationAmount = parseInt(document.querySelector('#donation-amount').value) || 0;
    if (donationAmount >= 0) {
      valid = true;
    }
    return valid;
  },
  checkRegistrationForm: function () { //Done
    let age = parseInt(document.querySelector('#register-age').value) || 0;
    if (age < 0) {
      return false;
    }
    let name = document.querySelector('#register-name').value || "";
    if (name.length == 0) {
      return false;
    }
    let breed = document.querySelector('#register-breed').value || "";
    if (breed.length == 0) {
      return false;
    }
    let location = document.querySelector('#register-location').value || "";
    if (location.length == 0) {
      return false;
    }
    let picture = document.querySelector('#register-picture').value || "";
    if (picture.length == 0) {
      return false;
    }
    if (picture.match(/\.(jpeg|jpg|gif|png)$/) == null) {
      return false;
    }
    return true;
  },
  filterByBreed: function (event) { //Done
    event.preventDefault();

    var breedValue = document.querySelector('#breed-filter').value;

    var meta;
    App.contracts.Adoption.deployed().then(function (instance) {
      meta = instance;

      // Execute adopt as a transaction by sending account
      return meta.filterPetsByBreed.call(breedValue);
    }).then(function (result) {
      for (let i = 0; i < ($('.panel-pet').length - 1); i++) {
        if (!result[i]) {
          $('.panel-pet').eq(i).parent().attr('style', "display: none;");
        }
        else {
          $('.panel-pet').eq(i).parent().attr('style', "");
        }
      }

    }).catch(function (err) {
      console.log(err.message);
    });

  },
  filterByAge: function (event) { //Done
    event.preventDefault();

    var ageValue = document.querySelector('#age-filter').value;

    var meta;
    App.contracts.Adoption.deployed().then(function (instance) {
      meta = instance;

      // Execute adopt as a transaction by sending account
      return meta.filterPetsByAge.call(ageValue);
    }).then(function (result) {
      for (let i = 0; i < ($('.panel-pet').length - 1); i++) {
        if (!result[i]) {
          $('.panel-pet').eq(i).parent().attr('style', "display: none;");
        }
        else {
          $('.panel-pet').eq(i).parent().attr('style', "");
        }
      }

    }).catch(function (err) {
      console.log(err.message);
    });

  },

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
