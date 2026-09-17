 interface Address {
  id: number;
  receiverName: string;
  receiverPhone: string;
  streetAddress: string;   
  subdistrict: string;     
  district: string;      
  zipcode:string 
  zipcodeId: number;
  province: string;      
  isDefault: boolean;
}



type DropdownItem = {
  id: number;
  name: string;
};

type AddressState = {
  addresses: Address[];
  defaultAddress: Address | null;
  provinces: DropdownItem[];
  districts: DropdownItem[];
  subdistricts: DropdownItem[];
  zipcodeId: DropdownItem[];
  loading: boolean;
};

export type { Address, DropdownItem, AddressState };
