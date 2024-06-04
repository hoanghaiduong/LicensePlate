package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

const patPrefix = "PAT"

// SmartContract of this fabric sample
type SmartContract struct {
	contractapi.Contract
}

// AddPatient issues a new patient to the world state with given details.
func (s *SmartContract) AddPatient(ctx contractapi.TransactionContextInterface, args string) Response {
	patient := &Patient{}
	err := JSONtoObject([]byte(args), patient)

	// Generate a unique composite key from the patient details
	patKey, err := ctx.GetStub().CreateCompositeKey(patPrefix, []string{patient.PatientID})

	isEmpExists, err := s.PatientExists(ctx, patKey)
	if isEmpExists {
		return BuildResponse("DUPLICATE", fmt.Sprintf("Patient record already exists in the blockchain"), nil)
	}
	if err != nil {
		return BuildResponse("ERROR", fmt.Sprintf("Failed to add new Patient to the blockchain"), nil)
	}

	objEmpBytes, err := ObjecttoJSON(patient)
	err = ctx.GetStub().PutState(patKey, objEmpBytes)
	if err != nil {
		return BuildResponse("ERROR", fmt.Sprintf("Failed to add new Patient to the blockchain"), nil)
	}
	return BuildResponse("SUCCESS", fmt.Sprintf("New patient record has been added to the blockchain successfully."), nil)

}

// PatientExists returns true when patient with given EmpId exists in world state
func (s *SmartContract) PatientExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	patientJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return patientJSON != nil, nil
}

// ReadPatient returns the patient stored in the world state with given id.
func (s *SmartContract) ReadPatient(ctx contractapi.TransactionContextInterface, args string) Response {
	patient := &Patient{}
	err := JSONtoObject([]byte(args), patient)

	patKey, err := ctx.GetStub().CreateCompositeKey(patPrefix, []string{patient.PatientID})
	patientBytes, err := ctx.GetStub().GetState(patKey)

	if err != nil {
		return BuildResponse("ERROR", fmt.Sprintf("Failed to read patient data from the blockchain"), nil)
	}
	if patientBytes == nil {
		return BuildResponse("ERROR", fmt.Sprintf("The patient %s does not exist", patient.FirstName), nil)
	}
	return BuildResponse("SUCCESS", "", patientBytes)
}

// Search patient record, checking the string starts with the key...(Remove '^' from regex to search anywhere in the string)
func (s *SmartContract) QueryByPartialKey(ctx contractapi.TransactionContextInterface, args string) Response {
	key := &SearchKey{}
	err := JSONtoObject([]byte(args), key)

	if err != nil {
		fmt.Println("Error when marshall json:", err)
	}

	keyVal := key.Key

	// Get the query iterator for the given key
	queryString := fmt.Sprintf(`{
        "selector": {
            "$or": [
                {"fName": {"$regex": "(?i)^%s"}},
                {"lName": {"$regex": "(?i)^%s"}},
                {"mobile": {"$regex": "(?i)^%s"}},
                {"address": {"$regex": "(?i)^%s"}}
            ]
        }
    }`, keyVal, keyVal, keyVal, keyVal)

	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		fmt.Println("error:", err)
		return BuildResponse("ERROR", fmt.Sprintf("Error occurred when query the database"), nil)
	}
	defer resultsIterator.Close()

	// Iterate over the results and create an array of PatientRecord objects
	var records []*Patient
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return BuildResponse("ERROR", fmt.Sprintf("Error occurred when iterate records"), nil)
		}

		var record Patient
		err = json.Unmarshal(queryResponse.Value, &record)
		if err != nil {
			return BuildResponse("ERROR", fmt.Sprintf("Error occurred when Unmarshal object"), nil)
		}
		records = append(records, &record)
	}

	patientBytes, err := ObjecttoJSON(records)
	return BuildResponse("SUCCESS", "", patientBytes)
}

// UpdatePatient updates an existing patient in the world state with provided parameters.
func (s *SmartContract) UpdatePatient(ctx contractapi.TransactionContextInterface, args string) Response {
	patient := &Patient{}
	err := JSONtoObject([]byte(args), patient)

	patKey, err := ctx.GetStub().CreateCompositeKey(patPrefix, []string{patient.PatientID})

	objEmpBytes, err := ObjecttoJSON(patient)
	err = ctx.GetStub().PutState(patKey, objEmpBytes)
	if err != nil {
		return BuildResponse("ERROR", fmt.Sprintf("Failed to update patient record in the blockchain"), nil)
	}
	return BuildResponse("SUCCESS", fmt.Sprintf("Patient record has been updated in the blockchain successfully."), nil)
}

// GetAllPatients returns all patients found in world state
func (s *SmartContract) GetAllPatients(ctx contractapi.TransactionContextInterface) Response {
	resultsIterator, err := ctx.GetStub().GetStateByPartialCompositeKey(patPrefix, []string{})
	if err != nil {
		return BuildResponse("ERROR", fmt.Sprintf("Failed to read patient data from the blockchain"), nil)
	}
	defer resultsIterator.Close()

	var patients []*Patient
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return BuildResponse("ERROR", fmt.Sprintf("Failed to read patient data from the blockchain"), nil)
		}

		var patient Patient
		err = json.Unmarshal(queryResponse.Value, &patient)
		if err != nil {
			return BuildResponse("ERROR", fmt.Sprintf("Failed to read patient data from the blockchain"), nil)
		}
		patients = append(patients, &patient)
	}
	patientBytes, err := ObjecttoJSON(patients)
	return BuildResponse("SUCCESS", "", patientBytes)
}

// DeletePatient deletes a given patient from the world state.
func (s *SmartContract) DeletePatient(ctx contractapi.TransactionContextInterface, args string) Response {
	patient := &Patient{}
	err := JSONtoObject([]byte(args), patient)

	patKey, err := ctx.GetStub().CreateCompositeKey(patPrefix, []string{patient.PatientID})

	patientBytes, err := ctx.GetStub().GetState(patKey)

	if err != nil {
		return BuildResponse("ERROR", fmt.Sprintf("Failed to read patient data from the blockchain"), nil)
	}
	if patientBytes == nil {
		return BuildResponse("ERROR", fmt.Sprintf("The patient %s does not exist", patient.FirstName), nil)
	}

	err = ctx.GetStub().DelState(patKey)
	if err != nil {
		return BuildResponse("ERROR", fmt.Sprintf("Failed to delete patient record from the blockchain"), nil)
	}
	return BuildResponse("SUCCESS", "Patient record deleted successfully.", nil)

}

func main() {
	chaincode, err := contractapi.NewChaincode(new(SmartContract))

	if err != nil {
		fmt.Printf("Error create employee details chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting employee details chaincode: %s", err.Error())
	}
}
