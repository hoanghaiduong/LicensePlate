/*
 * SPDX-License-Identifier: Apache-2.0
 */

package main

// Define structs to be used by chaincode

type User struct {
	UserID    string `json:"userId,required"`
	Name      string `json:"name"`
	Password  string `json:"password,required"`
	Address   string `json:"address"`
	Phone     string `json:"phone"`
	Email     string `json:"email"`
	PaymentID string `json:"paymentID"`
	Timestamp string `json:"timeStamp"`
}

type Patient struct {
	PatientID       string `json:"patientID"`
	FirstName       string `json:"fName"`
	LastName        string `json:"lName"`
	DOB             string `json:"dob"`
	Gender          string `json:"gender"`
	Mobile          string `json:"mobile"`
	EmergencyNumber string `json:"emergency_phone"`
	Address         string `json:"address"`
}

type SearchKey struct {
	Key string `json:"searchString"`
}

type PatientPvtData struct {
	PatientID         string `json:"patientID"`
	PastIllness       string `json:"pastIllness"`
	Surgeries         string `json:"surgeries"`
	Medications       string `json:"medications"`
	Allergies         string `json:"allergies"`
	SubstanceAbuse    string `json:"substanceAbuse"`
	DiagnosticResults string `json:"diagnosticResults"`
	TreatmentPlan     string `json:"treatmentPlan"`
	InsuranceInfo     string `json:"insuranceInfo"`
	FileCIDs          string `json:"fileLocations"`
}
