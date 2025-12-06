import type { Listing } from "../lib/listings"; 
import { Link } from "react-router-dom";

interface ListingCardProps {
    listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
    return (
        <Link to={`/student/listing/${listing.id}`} className="listing-card">
        {listing.imageUrl && (
            <div className="listing-card__image-wrapper">
            <img
                src={listing.imageUrl}
                alt={listing.title}
                className="listing-card__image"
            />
            </div>
        )}

        <div className="listing-card__body">
            <div className="listing-card__header">
            <h3 className="listing-card__title">{listing.title}</h3>
            <span className="listing-card__price">
                ${listing.price.toFixed(2)}
            </span>
            </div>

            <p className="listing-card__category">{listing.category}</p>
        </div>
        </Link>
    );
}