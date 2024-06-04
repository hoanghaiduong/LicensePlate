#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $6)
    local CP=$(one_line_pem $7)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${PEER}/$2/" \
        -e "s/\${P0PORT}/$3/" \
        -e "s/\${P1PORT}/$4/" \
        -e "s/\${CAPORT}/$5/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $6)
    local CP=$(one_line_pem $7)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${PEER}/$2/" \
        -e "s/\${P0PORT}/$3/" \
        -e "s/\${P1PORT}/$4/" \
        -e "s/\${CAPORT}/$5/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

## prepare connection profile for orgorg1
ORG=Org1
PEER=org1
P0PORT=4444
P1PORT=4454
CAPORT=4400
PEERPEM=organizations/peerOrganizations/org1/tlsca/tlsca.org1-cert.pem
CAPEM=organizations/peerOrganizations/org1/ca/ca.org1-cert.pem

echo "$(json_ccp $ORG $PEER $P0PORT $P1PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/org1/connection-org1.json
echo "$(yaml_ccp $ORG $PEER $P0PORT $P1PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/org1/connection-org1.yaml
# save another copy of json connection profile in a different directory
echo "$(json_ccp $ORG $PEER $P0PORT $P1PORT $CAPORT $PEERPEM $CAPEM)" > network-config/network-config-org1.json

## prepare connection profile for orgorg2
ORG=Org2
PEER=org2
P0PORT=5555
P1PORT=5565
CAPORT=5500
PEERPEM=organizations/peerOrganizations/org2/tlsca/tlsca.org2-cert.pem
CAPEM=organizations/peerOrganizations/org2/ca/ca.org2-cert.pem

echo "$(json_ccp $ORG $PEER $P0PORT $P1PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/org2/connection-org2.json
echo "$(yaml_ccp $ORG $PEER $P0PORT $P1PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/org2/connection-org2.yaml
# save another copy of json connection profile in a different directory
echo "$(json_ccp $ORG $PEER $P0PORT $P1PORT $CAPORT $PEERPEM $CAPEM)" > network-config/network-config-org2.json




