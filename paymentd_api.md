## Command Line Tool

### Formats
		let AmountFormat = amount[/currency[/issuer]]

### Exit Codes

		exit code:
		  success: 0
			invalid arguments: 1
			unable to contact paymentd: 2
			error: -1

		json: 
		{ ...
			exit_code: Integer,
			exit_message: String
			exit_token: ExitToken 
		}

### Common Arguments

	--sourceTag=Integer
	--fee=Integer(Drops)
	--previousHash=Hex
	--flags=Integer
	--uid=UID.v4
	-q: minimal output

# Payment

    pay destination amount(AmountFormat) sendMax(AmountFormat) --path=json --destinationTag=Integer --invoiceId=Hex  --noDirectRipple --partialPayment --limitQuality

	result: json
		{
			uid: UID.v4,
			index: Integer,
			exit_code: code
		}

# Outbound
  
    outbound --start(Index) --end(Index) --count
    outbound uid
    outbound --index=Integer

		result: json
		{
			exit_code: code,
			entries_count: Integer
			entries: [
				{
					uid: UID.v4,
					index: Integer,
					status: ['submitted', 'cancelled', 'cancelling'],
					result: 'tesSUCCESS'
				}
			]
		}

# Cancel 

	cancel uid
	cancel --index=Index

	exit codes:
		entry not found: 3

	result: json
	{
			uid: UID.v4, // if successful
			index: Integer // if successful
	}

# Inbound

  inbound [--start=LedgerIndex] [--end=LedgerIndex] --payments

	result: json
	{
      events: [
				...	
			],
			...
  }
