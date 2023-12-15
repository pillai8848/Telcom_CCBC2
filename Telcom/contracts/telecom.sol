// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Telecom {
    // enumeration to represent status of Telecom
    enum TelecomStatus { good, poor, Cancelled }
    TelecomStatus public status;
    
    // variable to store address of provider
    address public provider;
    
    // variables to store refund and delay credit amounts
    uint256 public refundAmount;
    uint256 public delayCredit;
    
    // variable to store address of contract owner
    address payable public owner;
    
    // variable to store a value for testing purposes
    uint public storedValue;

    // constructor function that takes address of provider as a parameter
    constructor(address _provider) {
        provider = _provider;
    }

    // constructor function that takes address of cusotmer as a parameter
    // constructor(address _cusotmer) {
    //     cusotmer = _cusotmer;
    // }

    // fallback function that can receive Ether
    receive() external payable{}    

    // function to get balance of contract
    function getBalance() external view returns (uint){
        return address(this).balance;
    }

    // function to add balance to contract from customer account
    function subscribeTelecom(uint256 amountInWei) public payable {
    // Ensure the amount sent is correct
    require(msg.value == amountInWei, "Incorrect amount sent");
    // The amount sent is automatically added to the contract's balance
}

    // function to periodends Telecom
    function periodends() public {
        // Require that Telecom is on time
        require(status == TelecomStatus.good, "Telecom is not on time");
        // Set status of Telecom to good
        status = TelecomStatus.good;
        // Transfer balance of contract to provider
        payable(provider).transfer(address(this).balance);
    }

    // function to handle Telecom delays
    function delay(bool isDueToNatureSafety, uint256 delayInMinutes) public {
        // Set status of Telecom to poor
        status = TelecomStatus.poor;
        // Initialize refund amount to zero
        refundAmount = 0;
        // Determine amount of delay credit based on delay time
        if (isDueToNatureSafety) {
            // No refund or payment, booking on next Telecom
            refundAmount = 0;
        } else if (delayInMinutes < 180) {
            // No extra payment
            refundAmount = 0;
        } else if (delayInMinutes >= 180 && delayInMinutes < 360) {
            // 400 CAD credit towards provider
            delayCredit = 4000000000000000000;
        } else if (delayInMinutes >= 360 && delayInMinutes < 540) {
            // 700 CAD credit towards provider
            delayCredit = 7000000000000000000;
        } else {
            // 1000 CAD credit towards provider
            delayCredit = 1000000000000000000;
        }
        
        // If there is delay credit, transfer it to sender
        if (delayCredit > 0) {
            payable(msg.sender).transfer(delayCredit);         
        }
    }

    // function to handle Telecom cancellations
    function cancel(bool isCancelledByCustomer, uint256 cancellationTimeInMinutes) public {
        // Require that Telecom is either good or poor
        require(status == TelecomStatus.good || status == TelecomStatus.poor, "Telecom cannot be cancelled");
        // Set status of Telecom to Cancelled
        status = TelecomStatus.Cancelled;
        
        // Calculate refund amount based on cancellation time and reason
        if (isCancelledByCustomer) {
            if (cancellationTimeInMinutes < 120) {
                // Full refund
                refundAmount = address(this).balance;
            } else {
                // Penalty and then balance will get refunded
                refundAmount = address(this).balance - (address(this).balance / 2);
        }
        } else {
            if (cancellationTimeInMinutes >= 120) {
                // Booking on next Telecom
                refundAmount = 0;
            } else {
                // Full refund
                refundAmount = address(this).balance;
            }
        }
        
        // If there is a refund amount, transfer to sender
        if (refundAmount > 0) {
            payable(msg.sender).transfer(refundAmount);
        }        
    }

    // Function to get delay credit
    function getDelayCredit() public view returns (uint256) {
        return delayCredit;
    }

    // Function to get refund amount
    function getRefundAmount() public view returns (uint256) {
        return refundAmount;
    }
}