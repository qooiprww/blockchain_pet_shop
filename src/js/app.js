App = {
  web3Provider: null,
  contracts: {},

  init: async function () {

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
      $.getJSON('../pets.json', function (data) {
        for (i = 0; i < data.length; i++) {
          App.registerJsonPets(data[i]);
        }
      });
      var petIds = App.getPetsIds();

      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < petIds.length(); i++) {
        var currentId = parseInt(petIds[i]);
        var petVotes = App.getPetNumVotes(currentId);
        var petName = App.getpetName(currentId);
        var petPicture = App.getpetPicture(currentId);
        var petbreed = App.getpetBreed(currentId);
        var petAge = App.getpetAge(currentId);
        var petLocation = App.getpetLocation(currentId);
        petTemplate.find('.panel-title').text(petName);
        petTemplate.find('img').attr('src', petPicture);
        petTemplate.find('.pet-breed').text(petbreed);
        petTemplate.find('.pet-age').text(petAge);
        petTemplate.find('.pet-location').text(petLocation);
        petTemplate.find('.pet-votes').text(petVotes);
        petTemplate.find('.btn-adopt').attr('data-id', currentId);
        petTemplate.find('.btn-vote').attr('data-id', currentId);

        petsRow.append(petTemplate.html());
        // Use our contract to retrieve and mark the adopted pets

      }
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-vote', App.handleVote);
    $(document).on('submit', '#donation', App.handleDonation);
  },
  checkDonationAmount: function () {
    let valid = false;
    let donationAmount = parseInt(document.querySelector('#donation-amount').value) || 0;
    if (donationAmount >= 0) {
      valid = true;
    }
    return valid;
  },
  markAdopted: function (adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function (instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function (adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('.btn-adopt').text('Success').attr('disabled', true);
        }
      }
    }).catch(function (err) {
      console.log(err.message);
    });
  },
  registerJsonPets: function (petData) {
    var adoptionInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function (instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.getPets();
      }).then(function (pets) {
        if (!pets.includes(petData.id)) {
          adoptionInstance.registerPet(petData.breed, petData.name, petData.age, { from: account, gas: 100000 })
            .then(function (result) { console.log(result) })
            .catch(function (err) {
              console.log(err.message);
            });
        }
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },
  getPetsIds: function () {
    var adoptionInstance;
    var petIds;
    App.contracts.Adoption.deployed().then(function (instance) {
      adoptionInstance = instance;

      // Execute adopt as a transaction by sending account
      return adoptionInstance.getPets();
    }).then(function (result) {
      petIds = result;
      console.log(result)
    }).catch(function (err) {
      console.log(err.message);
    });
    return petIds;
  },
  getNumVotes: function () {
    var adoptionInstance;
    var petVotes;
    App.contracts.Adoption.deployed().then(function (instance) {
      adoptionInstance = instance;

      // Execute adopt as a transaction by sending account
      return adoptionInstance.getNumVotes();
    }).then(function (result) {
      petVotes = result;
      console.log(petIds[0])
    }).catch(function (err) {
      console.log(err.message);
    });
    return petVotes;
  },
  getPetName: function () {
    var adoptionInstance;
    var petName;
    App.contracts.Adoption.deployed().then(function (instance) {
      adoptionInstance = instance;

      // Execute adopt as a transaction by sending account
      return adoptionInstance.getPetName(petId);
    }).then(function (result) {
      petName = result;
    }).catch(function (err) {
      console.log(err.message);
    });
    return petName;
  },
  getPetLocation: function () {
    var adoptionInstance;
    var petLocation;
    App.contracts.Adoption.deployed().then(function (instance) {
      adoptionInstance = instance;

      // Execute adopt as a transaction by sending account
      return adoptionInstance.getPetLocation(petId);
    }).then(function (result) {
      petLocation = result;
    }).catch(function (err) {
      console.log(err.message);
    });
    return petLocation;
  },
  getPetAge: function () {
    var adoptionInstance;
    var petAge;
    App.contracts.Adoption.deployed().then(function (instance) {
      adoptionInstance = instance;

      // Execute adopt as a transaction by sending account
      return adoptionInstance.getPetAge(petId);
    }).then(function (result) {
      petAge = result;
    }).catch(function (err) {
      console.log(err.message);
    });
    return petAge;
  },
  getPetBreed: function () {
    var adoptionInstance;
    var petBreed;
    App.contracts.Adoption.deployed().then(function (instance) {
      adoptionInstance = instance;

      // Execute adopt as a transaction by sending account
      return adoptionInstance.getPetBreed(petId);
    }).then(function (result) {
      petBreed = result;
    }).catch(function (err) {
      console.log(err.message);
    });
    return petBreed;
  },
  getPetPicture: function () {
    var adoptionInstance;
    var petPicture;
    App.contracts.Adoption.deployed().then(function (instance) {
      adoptionInstance = instance;

      // Execute adopt as a transaction by sending account
      return adoptionInstance.getPetPicture(petId);
    }).then(function (result) {
      petPicture = result;
    }).catch(function (err) {
      console.log(err.message);
    });
    return petPicture;
  },
  getPetNumVotes: function () {
    var adoptionInstance;
    var petVotes;
    App.contracts.Adoption.deployed().then(function (instance) {
      adoptionInstance = instance;

      // Execute adopt as a transaction by sending account
      return adoptionInstance.getPetNumVotes(petId);
    }).then(function (result) {
      petVotes = result;
    }).catch(function (err) {
      console.log(err.message);
    });
    return petVotes;
  },
  handleAdopt: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function (instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, { from: account });
      }).then(function (result) {
        return App.markAdopted();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },
  handleVote: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function (instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.vote(petId, { from: account });
      }).then(function (result) {
        $('.panel-pet').eq(petId).find('.btn-vote').text('Success').attr('disabled', true);
        $('.panel-pet').eq(petId).find('.pet-vote').text(result);
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },
  handleDonation: function (event) {
    event.preventDefault();

    let isDonationAmountValid = App.checkDonationAmount();

    if (isDonationAmountValid) {

      var donationAmount = document.querySelector('#donation-amount').value;

      var donationInstance;

      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0];

        App.contracts.Adoption.deployed().then(function (instance) {
          donationInstance = instance;

          // Execute adopt as a transaction by sending account
          return donationInstance.donate({ from: account, value: web3.toWei(donationAmount, "ether") });
        }).catch(function (err) {
          console.log(err.message);
        });
      });
    }
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
